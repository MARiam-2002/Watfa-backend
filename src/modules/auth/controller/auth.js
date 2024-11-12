import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword, signupTemp } from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
import randomstring from "randomstring";
import cartModel from "../../../../DB/models/cart.model.js";

export const register = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  const isUser = await userModel.findOne({ email });
  if (isUser) {
    return next(new Error("email already registered !", { cause: 409 }));
  }

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  const user = await userModel.create({
    userName,
    email,
    password: hashPassword,
  });
  const code = crypto.randomInt(100000, 999999).toString();

  user.forgetCode = code;
  await user.save();

  const isSent = await sendEmail({
    to: email,
    subject: "Verify Account",
    html: resetPassword(code),
  });
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_KEY
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });
  return isSent
    ? res.status(200).json({
        success: true,
        data: { token },
      })
    : next(new Error("something went wrong!", { cause: 400 }));
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new Error("Invalid-Email", { cause: 400 }));
  }

  if (!user.isConfirmed) {
    return next(new Error("Un activated Account", { cause: 400 }));
  }

  const match = bcryptjs.compareSync(password, user.password);

  if (!match) {
    return next(new Error("Invalid-Password", { cause: 400 }));
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_KEY
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  user.status = "online";
  await user.save();

  return res.status(200).json({
    success: true,
    data: { token },
  });
});

//send forget Code

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("Invalid email!", { cause: 400 }));
  }

  const code = crypto.randomInt(100000, 999999).toString();

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

  const code = crypto.randomInt(100000, 999999).toString();

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
