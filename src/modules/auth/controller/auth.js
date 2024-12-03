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
    userNameOrEmail,
    password,
    confirmPassword,
    phoneNumber,
    role,
    companyName,
    country,
  } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmail = emailRegex.test(userNameOrEmail);

  const conditions = [];
  if (isEmail) {
    conditions.push({ email: userNameOrEmail });
  } else {
    conditions.push({ userName: userNameOrEmail });
  }
  
  const isUser = await userModel.findOne({ $or: conditions });
  

  if (isUser) {
    return res.status(404).json({
      success: false,
      message: "Email or Username is already registered!",
    });
  }
  

  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match!", { cause: 400 }));
  }

  if (!["buyer", "seller"].includes(role)) {
    return next(new Error("Invalid role provided!", { cause: 400 }));
  }

  if (role === "seller" && !companyName) {
    return next(
      new Error("Company name is required for sellers!", { cause: 400 })
    );
  }

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  const user = await userModel.create({
    userName: isEmail ? null : userNameOrEmail,
    email: isEmail ? userNameOrEmail : null,
    password: hashPassword,
    phoneNumber,
    role,
    companyName,
    country,
  });

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
      email: user.email,
      userName: user.userName,
      phone:user.phoneNumber,
      country:user.country,
      role,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { userNameOrEmail, password } = req.body;

  // Regular Expression to validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmail = emailRegex.test(userNameOrEmail);

  const user = await userModel.findOne({
    $or: [
      { email: isEmail ? userNameOrEmail : null },
      { userName: !isEmail ? userNameOrEmail : null },
    ],
  });

  if (!user) {
    return next(
      new Error("Invalid Username or Email. Please try again.", { cause: 400 })
    );
  }

  const isPasswordValid = bcryptjs.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new Error("Invalid Password. Please try again.", { cause: 400 })
    );
  }

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
      phone:user.phoneNumber,
      country:user.country,
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
    message: "Go to reset new password",
  });
});

export const resetPasswordByCode = asyncHandler(async (req, res, next) => {
  if (req.user.forgetCode) {
    return next(new Error("Please verify code first!", { status: 400 }));
  }
  const newPassword = bcryptjs.hashSync(
    req.body.password,
    +process.env.SALT_ROUND
  );
  await userModel.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { password: newPassword }
  );

  //invalidate tokens
  const tokens = await tokenModel.find({ user: req.user._id });

  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  return res.status(200).json({ success: true, message: "Try to login!" });
});

export const allCountryWithFlag = asyncHandler((req, res,next) => {
  console.log("allCountryWithFlag");
  const countriesData = Object.keys(countries).map((code) => ({
    name: countries[code].name,
    code: code,
    phone: `+${countries[code].phone}`,
    flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
  }));

  return res.json({
    success: true,
    message: "Countries with flags",
    data: countriesData,
  });


});
