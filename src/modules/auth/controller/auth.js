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
  const {
    userName,
    email,
    password,
    role,
    phoneNumber,
    companyName,
    country,
  } = req.body;

  const isUser = await userModel.findOne({ email });
  if (isUser) {
    return next(new Error("Email is already registered!", { cause: 409 }));
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
    country
  
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

  const code = crypto.randomInt(1000, 9999).toString();
  user.forgetCode = code;
  await user.save();

  const isSent = await sendEmail({
    to: email,
    subject: "Verify Account",
    html: resetPassword(code),
  });

  if (!isSent) {
    return next(
      new Error("Failed to send verification email!", { cause: 500 })
    );
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
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
      userName,
      role,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new Error("Invalid Email. Please try again.", { cause: 400 }));
  }

  if (!user.isConfirmed) {
    return next(
      new Error("Account is not activated. Please verify your email.", {
        cause: 400,
      })
    );
  }

  const isPasswordValid = bcryptjs.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new Error("Invalid Password. Please try again.", { cause: 400 })
    );
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
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
      userName: user.userName,
      role: user.role,
      token,
    },
  });
});

//send forget Code

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }

  const code = crypto.randomInt(1000, 9999).toString();

  user.forgetCode = code;
  await user.save();

  return (await sendEmail({
    to: user.email,
    subject: "Reset Password",
    html: resetPassword(code),
  }))
    ? res.status(200).json({ success: true, message: "check you email!" })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const resendCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });
  if (!user) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }

  const code = crypto.randomInt(1000, 9999).toString();

  user.forgetCode = code;
  await user.save();

  return (await sendEmail({
    to: user.email,
    subject: "Verify Account",
    html: resetPassword(code),
  }))
    ? res.status(200).json({ success: true, message: "check you email!" })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const VerifyCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });

  if (!user.forgetCode) {
    return next(new Error("Please resend the forget code.", { status: 400 }));
  }

  if (user.forgetCode !== req.body.forgetCode) {
    return next(new Error("Invalid code!", { status: 400 }));
  }

  const updateData = { $unset: { forgetCode: 1 } };
  let message = "Go to reset new password";

  if (!user.isConfirmed) {
    user.isConfirmed = true;
    await user.save();
    message = "Account successfully verified";
  }

  await userModel.updateOne({ email: req.user.email }, updateData);

  return res.status(200).json({
    success: true,
    status: 200,
    data: { message },
  });
});

export const resetPasswordByCode = asyncHandler(async (req, res, next) => {
  const newPassword = bcryptjs.hashSync(
    req.body.password,
    +process.env.SALT_ROUND
  );
  const checkUser = await userModel.findOne({ email: req.body.email });
  if (!checkUser) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }
  if (checkUser.forgetCode !== req.body.forgetCode) {
    return next(new Error("Invalid code!", { status: 400 }));
  }
  const user = await userModel.findOneAndUpdate(
    { email: req.body.email },
    { password: newPassword, $unset: { forgetCode: 1 } }
  );

  //invalidate tokens
  const tokens = await tokenModel.find({ user: user._id });

  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  return res.status(200).json({ success: true, message: "Try to login!" });
});

export const verifyFingerprintAPI = asyncHandler(
  asyncHandler(async (req, res, next) => {
    const { fingerprint } = req.body;
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return next(new Error("User not found!", { cause: 404 }));
    }

    if (!(user.fingerprint === fingerprint)) {
      return next(
        new Error("Fingerprint verification failed!", { cause: 400 })
      );
    }

    return res
      .status(200)
      .json({ success: true, message: "Fingerprint verified successfully!" });
  })
);

export const verifyFaceAPI = asyncHandler(
  asyncHandler(async (req, res, next) => {
    const { faceData } = req.body;
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return next(new Error("User not found!", { cause: 404 }));
    }

    if (!(user.faceData === faceData)) {
      return next(new Error("Face verification failed!", { cause: 400 }));
    }

    return res
      .status(200)
      .json({ success: true, message: "Face verified successfully!" });
  })
);

export const allCountryWithFlag = asyncHandler((req, res) => {
  const countriesData = Object.keys(countries).map((code) => ({
    name: countries[code].name,
    code: code,
    phone: `+${countries[code].phone}`,
    flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
  }));

  res.json(countriesData);
});
