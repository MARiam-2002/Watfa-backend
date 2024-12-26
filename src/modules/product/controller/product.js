import axios from "axios";
import sellerModel from "../../../../DB/models/seller.model.js";
import productModel from "../../../../DB/models/product.model.js";
export const fetchProductsFromPlatform = asyncHandler(async (req, res) => {
  const { sellerId, platformName, storeURL } = req.body;

  // Verify seller existence
  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    return res
      .status(404)
      .json({ success: false, message: "Seller not found." });
  }

  // Find the connected platform
  const platform = seller.profileDetails.platforms.find(
    (p) => p.platformName === platformName && p.storeURL === storeURL
  );

  if (!platform) {
    return res
      .status(404)
      .json({ success: false, message: "Platform not connected." });
  }

  // Fetch products based on the platform
  let products = [];
  switch (platformName) {
    case "Shopify":
      products = await fetchShopifyProducts(platform);
      break;
    case "Salla":
      products = await fetchSallaProducts(platform);
      break;
    case "Zid":
      products = await fetchZidProducts(platform);
      break;
    case "WooCommerce":
      products = await fetchWooCommerceProducts(platform);
      break;
    default:
      return res
        .status(400)
        .json({ success: false, message: "Unsupported platform." });
  }

  // Save products to the database
  const savedProducts = await Promise.all(
    products.map(async (product) => {
      // Avoid duplicate products
      const existingProduct = await productModel.findOne({
        platformProductId: product.id || product.productId,
        sellerId,
      });
      if (existingProduct) return existingProduct;

      const newProduct = new productModel({
        sellerId,
        platformName,
        platformProductId: product.id || product.productId,
        title: product.title || product.name,
        description: product.body_html || product.description,
        price:
          product.price || (product.variants && product.variants[0]?.price),
        currency: product.currency || "SAR",
        stock: product.inventory_quantity || product.stock,
        images: product.images?.map((img) => img.src) || [],
        category: product.category || "Uncategorized",
        tags: product.tags?.split(",") || [],
        variants: product.variants || [],
        storeURL: storeURL,
      });

      return newProduct.save();
    })
  );

  return res.status(200).json({
    success: true,
    message: `Products fetched and stored successfully from ${platformName}.`,
    products: savedProducts,
  });
});

// Helper functions to fetch products from external APIs
const fetchShopifyProducts = asyncHandler(async (platform) => {
  const url = `${platform.storeURL}/admin/api/2024-01/products.json`;
  const response = await axios.get(url, {
    headers: { "X-Shopify-Access-Token": platform.accessToken },
  });
  return response.data.products || [];
});

const fetchSallaProducts = asyncHandler(async (platform) => {
  const url = `${platform.storeURL}/api/v1/products`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${platform.accessToken}` },
  });
  return response.data.data || [];
});

const fetchZidProducts = asyncHandler(async (platform) => {
  const url = `${platform.storeURL}/api/v1/products`;
  const response = await axios.get(url, {
    headers: { "Api-Key": platform.apiKey },
  });
  return response.data.products || [];
});

const fetchWooCommerceProducts = asyncHandler(async (platform) => {
  const url = `${platform.storeURL}/wp-json/wc/v3/products?consumer_key=${platform.apiKey}&consumer_secret=${platform.secretKey}`;
  const response = await axios.get(url);
  return response.data || [];
});
