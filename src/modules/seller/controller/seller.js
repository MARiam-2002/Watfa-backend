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
  const { sellerId, platformName, storeURL, apiKey, secretKey, accessToken } =
    req.body;

  // Verify seller existence
  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    return res
      .status(404)
      .json({ success: false, message: "Seller not found." });
  }

  // Validate required fields for each platform
  switch (platformName) {
    case "Shopify":
    case "Salla":
      if (!accessToken) {
        return res.status(400).json({
          success: false,
          message: "Access token is required for this platform.",
        });
      }
      break;
    case "Zid":
      if (!apiKey) {
        return res
          .status(400)
          .json({ success: false, message: "API key is required for Zid." });
      }
      break;
    case "WooCommerce":
      if (!apiKey || !secretKey) {
        return res.status(400).json({
          success: false,
          message: "API key and Secret key are required for WooCommerce.",
        });
      }
      break;
    default:
      return res
        .status(400)
        .json({ success: false, message: "Unsupported platform." });
  }

  // Prepare platform data
  const platformData = {
    platformName,
    storeURL,
    apiKey: apiKey || null,
    secretKey: secretKey || null,
    accessToken: accessToken || null,
  };

  // Save platform data to seller's profile
  seller.profileDetails.platforms.push(platformData);
  await seller.save();

  return res.status(200).json({
    success: true,
    message: `${platformName} connected successfully.`,
  });
});
