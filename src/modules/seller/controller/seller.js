import jwt from "jsonwebtoken";
import sellerModel from "../../../../DB/models/seller.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import tokenModel from "../../../../DB/models/token.model.js";
import axios from "axios";

export const registerSeller = asyncHandler(async (req, res) => {
  const { userName, email, phoneNumber, password, role, country } = req.body;
  const isSeller = await sellerModel.findOne({
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
      id: newSeller._id,
      email: newSeller.email,
      userName: newSeller.userName,
      role: newSeller.role,
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
    platformName,
    storeURL,
    apiKey,
    secretKey,
    accessToken,
    additionalInfo,
  } = req.body;

  const sellerId = req.seller._id;

  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    return res
      .status(404)
      .json({ success: false, message: "Seller not found." });
  }

  const validPlatforms = ["Shopify", "Salla", "WooCommerce", "Direct", "Other"];
  if (!validPlatforms.includes(platformName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid integration type.",
    });
  }

  if (platformName === "Direct" && (!apiKey || !secretKey)) {
    return res.status(400).json({
      success: false,
      message: "API Key and Secret Key are required for Direct Integration.",
    });
  } else if (platformName === "Other" && !accessToken) {
    return res.status(400).json({
      success: false,
      message: "AccessToken is required for Other Integration.",
    });
  }

  const platformData = {
    platformName,
    storeURL,
    apiKey: apiKey || null,
    secretKey: secretKey || null,
    accessToken: accessToken || null,
    additionalInfo: additionalInfo || null,
  };

  const storeLogo = await fetchStoreLogo(platformData);

  seller.profileDetails.platforms.push(platformData);
  seller.logo = storeLogo; 
  await seller.save();

  return res.status(200).json({
    success: true,
    message: `Platform integration for ${platformName} successful.`,
  });
});

const fetchStoreLogo = async (platform) => {
  switch (platform.platformName) {
    case "Shopify":
      return await fetchShopifyLogo(platform);
    case "Salla":
      return await fetchSallaLogo(platform);
    case "WooCommerce":
      return await fetchWooCommerceLogo(platform);
    default:
      return "DefaultLogoURL";
  }
};
const fetchShopifyLogo = async (storeURL, accessToken) => {
  try {
    // سحب القوالب الخاصة بالمتجر
    const response = await axios.get(`${storeURL}/admin/api/2024-01/themes.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    // العثور على القالب الرئيسي
    const mainTheme = response.data.themes.find(theme => theme.role === 'main');
    if (mainTheme && mainTheme.settings && mainTheme.settings.logo) {
      return mainTheme.settings.logo;  // استرجاع رابط الشعار
    } else {
      return "DefaultLogoURL";  // إذا لم يتم العثور على الشعار
    }
  } catch (error) {
    console.error("Error fetching logo:", error.response?.data || error.message);
    return "DefaultLogoURL";  // الشعار الافتراضي في حالة حدوث خطأ
  }
};



const fetchSallaLogo = async (platform) => {
  try {
    const sallaResponse = await axios.get(
      `${platform.storeURL}/api/v1/store-info`,
      {
        headers: { Authorization: `Bearer ${platform.accessToken}` },
      }
    );
    return sallaResponse.data.logo || "DefaultLogoURL";
  } catch (error) {
    console.error("Error fetching Salla logo:", error.message);
    return "DefaultLogoURL";
  }
};

const fetchWooCommerceLogo = async (platform) => {
  return `${platform.storeURL}/wp-content/uploads/logo.png`;
};

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
