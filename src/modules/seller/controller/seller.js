import jwt from "jsonwebtoken";
import sellerModel from "../../../../DB/models/seller.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const registerSeller = asyncHandler(async (req, res) => {
  const { userName, email, phoneNumber, password, role, country } = req.body;
  const isSeller = await userModel.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (isSeller) {
    return res
      .status(400)
      .json({ success: false, message: "Email or userName already exists!" });
  }
  const newSeller = new sellerModel({
    userName,
    email,
    phoneNumber,
    password,
    country,
    role,
  });

  await newSeller.save();

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
    seller: newSeller._id,
    agent: req.headers["user-agent"],
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful!",
    data: {
      email: newSeller.email,
      userName: newSeller.userName,
      phone: newSeller.phoneNumber,
      country: newSeller.country,
      role: newSeller.role,
      token,
    },
  });
});

export const UpdateSellerProfile = asyncHandler(async (req, res) => {
  const {
    companyName,
    operationsCountry,
    businessType,
    storeLink,
    productsOrServices,
  } = req.body;

  const sellerId = req.seller._id; // Assuming `req.user` contains the authenticated seller's ID.

  // Validate store link format
  const urlPattern =
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  if (storeLink && !urlPattern.test(storeLink)) {
    return res.status(400).json({
      success: false,
      message: "Invalid store link format.",
    });
  }

  // Find the seller by ID
  const seller = await sellerModel.findById(sellerId);

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found.",
    });
  }

  // Update seller's profile details
  seller.profileDetails = {
    ...seller.profileDetails,
    companyName: companyName || seller.profileDetails?.companyName,
    operationsCountry:
      operationsCountry || seller.profileDetails?.operationsCountry,
    businessType: businessType || seller.profileDetails?.businessType,
    storeLink: storeLink || seller.profileDetails?.storeLink,
    productsOrServices:
      productsOrServices || seller.profileDetails?.productsOrServices,
  };

  // Save updated seller data
  const updatedSeller = await seller.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: updatedSeller,
  });
});

export const connectPlatform = asyncHandler(async (req, res) => {
  const {
    sellerId,
    platformName,
    storeURL,
    apiKey,
    secretKey,
    accessToken,
    additionalInfo,
  } = req.body;

  // التحقق من وجود البائع
  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    return res
      .status(404)
      .json({ success: false, message: "Seller not found." });
  }

  // التحقق من نوع التكامل والحقول المطلوبة
  if (platformName === "Direct") {
    if (!apiKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "API Key and Secret Key are required for Direct Integration.",
      });
    }
  } else if (platformName === "Other") {
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "accessToken is required for Other Integration.",
      });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid integration type." });
  }

  // إعداد بيانات المنصة
  const platformData = {
    platformName,
    storeURL,
    apiKey: apiKey || null,
    secretKey: secretKey || null,
    accessToken: accessToken || null,
    additionalInfo: additionalInfo || null,
  };

  // حفظ بيانات المنصة في بروفايل البائع
  seller.profileDetails.platforms.push(platformData);
  await seller.save();

  return res.status(200).json({
    success: true,
    message: `${platformName} connected successfully using ${integrationType} Integration.`,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const seller = await seller.findOne({
    email,
  });

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found. Please register.",
    });
  }

  const isPasswordValid = bcryptjs.compareSync(password, seller.password);
  if (!isPasswordValid) {
    return next(
      new Error("Invalid Password. Please try again.", { cause: 400 })
    );
  }

  const token = jwt.sign(
    {
      id: seller._id,
      email: seller.email,
      userName: seller.userName,
      role: seller.role,
    },
    process.env.TOKEN_KEY
  );

  await tokenModel.create({
    token,
    seller: newSeller._id,
    agent: req.headers["user-agent"],
  });

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      email: seller.email,
      userName: seller.userName,
      phone: seller.phoneNumber,
      country: seller.country,
      role: seller.role,
      token,
    },
  });
});
