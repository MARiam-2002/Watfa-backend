import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto, { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword, signupTemp } from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
import { countries } from "countries-list";
import cloudinary from "../../../utils/cloud.js";
import cardModel from "../../../../DB/models/crediteCard.model.js";

export const register = asyncHandler(async (req, res, next) => {
  const {
    email,
    userName,
    password,
    confirmPassword,
    phoneNumber,
    role,
    companyName,
    country,
  } = req.body;

  const isUser = await userModel.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (isUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email or userName already exists!" });
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
    userName,
    email,
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
      phone: user.phoneNumber,
      country: user.country,
      role,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found. Please register.",
    });
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
      phone: user.phoneNumber,
      country: user.country,
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

export const allCountryWithFlag = asyncHandler((req, res, next) => {
  const gulfCountriesCodes = ["BH", "KW", "OM", "QA", "SA", "AE"];

  const gulfCountriesData = gulfCountriesCodes.map((code) => ({
    name: countries[code].name,
    code: code,
    phone: `+${countries[code].phone}`,
    flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
  }));

  return res.json({
    success: true,
    message: "Gulf Countries with flags",
    data: gulfCountriesData,
  });
});

export const fingerprint = asyncHandler(async (req, res) => {
  const { isFingerprintAuth } = req.body;

  if (isFingerprintAuth) {
    return res.status(200).json({
      success: true,
      message: "Login with your fingerprint successful.",
      data: {
        email: req.user.email,
        userName: req.user.userName,
        phone: req.user.phoneNumber,
        country: req.user.country,
        role: req.user.role,
        token: req.headers["token"],
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid fingerprint authentication.",
    });
  }
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { email, userName, phoneNumber, country } = req.body;

  const isUnique = async (field, value) => {
    const exists = await userModel.findOne({
      [field]: value,
      _id: { $ne: id },
    });
    if (exists) {
      throw new Error(`${field} already exists!`, { cause: 400 });
    }
  };

  try {
    if (email) await isUnique("email", email);
    if (userName) await isUnique("userName", userName);
  } catch (error) {
    return next(error);
  }

  const updates = { email, userName, phoneNumber, country };

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.FOLDER_CLOUDINARY}/user/${id}/profileImage`,
      }
    );

    if (req.user.profileImage?.id) {
      await cloudinary.uploader.destroy(req.user.profileImage.id);
    }

    updates.profileImage = { url: secure_url, id: public_id };
  }

  Object.keys(updates).forEach(
    (key) => updates[key] === undefined && delete updates[key]
  );

  if (Object.keys(updates).length === 0) {
    return next(new Error("No valid fields to update!", { cause: 400 }));
  }

  const updatedUser = await userModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: {
      email: updatedUser.email,
      userName: updatedUser.userName,
      phone: updatedUser.phoneNumber,
      country: updatedUser.country,
      profileImage: updatedUser.profileImage,
    },
  });
});

export const addCardForUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { cardHolderName, cardNumber, expireDate, cvc } = req.body;

  // Encrypt the card number for comparison
  const encryptedCardNumber = encrypt(cardNumber);

  const isCardExist = await cardModel.findOne({ cardNumber: encryptedCardNumber });
  if (isCardExist) {
    return next(new Error("Card with this number already exists!", { cause: 400 }));
  }

  const newCard = new cardModel({
    cardHolderName,
    cardNumber,
    expireDate,
    cvc,
  });

  await newCard.save();

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  user.cards.push(newCard._id);
  await user.save();

  return res.status(201).json({
    success: true,
    message: "Card added successfully!",
    data: {
      cardHolderName: newCard.cardHolderName,
      last4: newCard.last4,
      cardType: newCard.cardType,
    },
  });
});


export const getCardsForUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; 

  const user = await userModel.findById(userId).populate("cards", "cardHolderName last4 cardType"); // جلب الحقول فقط

  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "User cards retrieved successfully!",
    data: user.cards,
  });
});
