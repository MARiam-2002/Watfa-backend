import axios from "axios";
import sellerModel from "../../../../DB/models/seller.model.js";
import productModel from "../../../../DB/models/product.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const fetchProductsFromPlatform = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;
  const platformName = req.seller.profileDetails.platforms[0].platformName;
  const storeURL = req.seller.profileDetails.platforms[0].storeURL;

  const seller = await sellerModel.findById(sellerId);
  if (!seller) {
    return res
      .status(404)
      .json({ success: false, message: "Seller not found." });
  }

  // البحث عن المنصة المتصلة
  const platform = seller.profileDetails.platforms.find(
    (p) => p.platformName === platformName && p.storeURL === storeURL
  );

  if (!platform) {
    return res
      .status(404)
      .json({ success: false, message: "Platform not connected." });
  }

  // جلب المنتجات بناءً على نوع المنصة
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

  // حفظ المنتجات في قاعدة البيانات
  const savedProducts = await Promise.all(
    products.map(async (product) => {
      // تجنب تكرار المنتجات
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
        description: product.body_html.replace(/<[^>]*>/g, '') || product.description.replace(/<[^>]*>/g, ''),
        price:
          product.price || (product.variants && product.variants[0]?.price),
        comparePrice:
          (product.variants && product.variants[0]?.compare_at_price) || null, // إضافة السعر القديم إذا كان موجودًا
        currency: product.currency || "SAR",
        stock: product.inventory_quantity || product.stock,
        images: product.images?.map((img) => img.src) || [],
        category: (product.category && product.category[0]) || "Uncategorized",
        tags: product.tags?.split(",") || [],
        variants: product.variants.map((variant) => ({
          title: variant.title,
          price: variant.price,
          stock: variant.inventory_quantity || variant.stock, // تأكد من أنك تستخدم القيم الصحيحة
        })),
        ratings: {
          average: product.average_rating || 0,  // إضافة متوسط التقييم
          count: product.reviews_count || 0,     // إضافة عدد التقييمات
        },
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

// دوال مساعدة لجلب المنتجات من APIs مختلفة
const fetchShopifyProducts = async (platform) => {
  const url = `${platform.storeURL}/admin/api/2024-01/products.json`;
  const response = await axios.get(url, {
    headers: { "X-Shopify-Access-Token": platform.accessToken },
  });

  return response.data.products.map(product => {
    const category = product.collections?.[0]?.title || product.tags?.[0] || "Uncategorized"; // استخراج الفئة من collections أو tags
    const averageRating = product.metafields?.rating || 0;  // تأكد من مصدر التقييمات
    const reviewCount = product.reviews_count || 0;

    return {
      ...product,
      category,  // إضافة الفئة
      ratings: { average: averageRating, count: reviewCount },  // إضافة التقييمات
    };
  });
};

const fetchSallaProducts = async (platform) => {
  const url = `${platform.storeURL}/api/v1/products`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${platform.accessToken}` },
  });

  return response.data.data.map(product => {
    const category = product.category || "Uncategorized";  // تأكد من المسار الصحيح للفئة
    const averageRating = product.average_rating || 0;
    const reviewCount = product.reviews_count || 0;

    return {
      ...product,
      category,  // إضافة الفئة
      ratings: { average: averageRating, count: reviewCount },  // إضافة التقييمات
    };
  });
};

const fetchZidProducts = async (platform) => {
  const url = `${platform.storeURL}/api/v1/products`;
  const response = await axios.get(url, {
    headers: { "Api-Key": platform.apiKey },
  });

  return response.data.products.map(product => {
    const category = product.category || "Uncategorized";  // تأكد من المسار الصحيح للفئة
    const averageRating = product.average_rating || 0;
    const reviewCount = product.reviews_count || 0;

    return {
      ...product,
      category,  // إضافة الفئة
      ratings: { average: averageRating, count: reviewCount },  // إضافة التقييمات
    };
  });
};

const fetchWooCommerceProducts = async (platform) => {
  const url = `${platform.storeURL}/wp-json/wc/v3/products?consumer_key=${platform.apiKey}&consumer_secret=${platform.secretKey}`;
  const response = await axios.get(url);

  return response.data.map(product => {
    const category = product.categories?.[0]?.name || "Uncategorized";  // استخراج الفئة
    const averageRating = product.average_rating || 0;
    const reviewCount = product.review_count || 0;

    return {
      ...product,
      category,  // إضافة الفئة
      ratings: { average: averageRating, count: reviewCount },  // إضافة التقييمات
    };
  });
};

