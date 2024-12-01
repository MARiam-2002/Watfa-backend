import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword, signupTemp } from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
// import randomstring from "randomstring";
// import cartModel from "../../../../DB/models/cart.model.js";
import cloudinary from "../../../utils/cloud.js";
import { countries } from "countries-list";

export const register = asyncHandler(async (req, res, next) => {
  const { userName, email, password, role, phoneNumber, companyName, country } =
    req.body;

  const isUser = await userModel.findOne({
    $or: [{ email: email }, { userName: userName }],
  });
  if (isUser) {
    return next(
      new Error("Email Or userName is already registered!", { cause: 409 })
    );
  }

  if (!["buyer", "seller"].includes(role)) {
    return next(new Error("Invalid role provided!", { cause: 400 }));
  }

  if (role === "seller") {
    if (!companyName) {
      return next(
        new Error("Company name is required for sellers!", { cause: 400 })
      );
    }
  }

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  const user = await userModel.create({
    userName,
    email,
    password: hashPassword,
    role,
    phoneNumber,
    companyName,
    country,
  });

  // if (role === "seller" && req.file) {
  //   const { secure_url, public_id } = await cloudinary.uploader.upload(
  //     req.file.path,
  //     {
  //       folder: `${process.env.FOLDER_CLOUDINARY}/sellers/${user._id}`,
  //     }
  //   );
  //   user.document = { url: secure_url, id: public_id };
  //   await user.save();
  // }

  // const code = crypto.randomInt(1000, 9999).toString();
  // user.forgetCode = code;
  // await user.save();

  // const isSent = await sendEmail({
  //   to: email,
  //   subject: "Verify Account",
  //   html: resetPassword(code),
  // });

  // if (!isSent) {
  //   return next(
  //     new Error("Failed to send verification email!", { cause: 500 })
  //   );
  // }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    },
    process.env.TOKEN_KEY
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful!",
    data: {
      email,
      userName,
      role,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password, userName } = req.body;

  const user = await userModel.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (!user) {
    return next(
      new Error("Invalid Email Or userName . Please try again.", { cause: 400 })
    );
  }

  // if (!user.isConfirmed) {
  //   return next(
  //     new Error("Account is not activated. Please verify your email.", {
  //       cause: 400,
  //     })
  //   );
  // }

  const isPasswordValid = bcryptjs.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new Error("Invalid Password. Please try again.", { cause: 400 })
    );
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, userName: userName, role: user.role },
    process.env.TOKEN_KEY
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"] || "unknown",
  });

  user.status = "online";
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      email: user.email,
      userName: user.userName,
      role: user.role,
      token,
    },
  });
});

//send forget Code

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  // const user = await userModel.findOne({ email: req.body.email });

  // if (!user) {
  //   return next(new Error("Invalid email!", { cause: 400 }));
  // }

  const code = crypto.randomInt(1000, 9999).toString();

  req.user.forgetCode = code;
  await req.user.save();

  return (await sendEmail({
    to: req.body.email,
    subject: "Reset Password",
    html: resetPassword(code),
  }))
    ? res.status(200).json({ success: true, message: "check you email!" })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const resendCode = asyncHandler(async (req, res, next) => {
  const code = crypto.randomInt(1000, 9999).toString();

  req.user.forgetCode = code;
  await req.user.save();

  return (await sendEmail({
    to: req.body.email,
    subject: "Verify Account",
    html: resetPassword(code),
  }))
    ? res.status(200).json({ success: true, message: "check you email!" })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const VerifyCode = asyncHandler(async (req, res, next) => {
  if (!req.user.forgetCode) {
    return next(new Error("Please resend the forget code.", { status: 400 }));
  }

  if (req.user.forgetCode !== req.body.forgetCode) {
    return next(new Error("Invalid code!", { status: 400 }));
  }

  await userModel.updateOne(
    {
      $or: [{ email: req.user.email }, { username: req.user.userNme }],
    },
    { $unset: { forgetCode: 1 } }
  );
  return res.status(200).json({
    success: true,
    status: 200,
    data: { message: "Go to reset new password" },
  });
});

export const resetPasswordByCode = asyncHandler(async (req, res, next) => {
  const newPassword = bcryptjs.hashSync(
    req.body.password,
    +process.env.SALT_ROUND
  );
  await userModel.findOneAndUpdate(
    {
      $or: [{ email: req.user.email }, { username: req.user.userName }],
    },
    { password: newPassword }
  );

  //invalidate tokens
  const tokens = await tokenModel.find({ user: req.user._id });

  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  return res
    .status(200)
    .json({ success: true, status: 200, message: "Try to login!" });
});

export const allCountryWithFlag = asyncHandler((req, res) => {
  const countriesData = Object.keys(countries).map((code) => ({
    name: countries[code].name,
    code: code,
    phone: `+${countries[code].phone}`,
    flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
  }));

  res.json(countriesData);
});
