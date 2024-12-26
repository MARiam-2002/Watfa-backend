import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true, // الإشارة إلى البائع الذي يمتلك المنتج
    },
    platformName: {
      type: String,
      required: true, // اسم المنصة مثل Shopify, Salla, WooCommerce
    },
    platformProductId: {
      type: String,
      required: true, // المعرف الخاص للمنتج في المنصة
    },
    title: {
      type: String,
      required: true, // اسم المنتج
    },
    description: {
      type: String, // وصف المنتج
    },
    price: {
      type: Number, // سعر المنتج
    },
    currency: {
      type: String, // عملة السعر (مثل SAR, USD)
    },
    stock: {
      type: Number, // الكمية المتوفرة من المنتج
    },
    images: [
      {
        type: String, // روابط الصور الخاصة بالمنتج
      },
    ],
    category: {
      type: String, // تصنيف المنتج (إذا توفر)
    },
    tags: [
      {
        type: String, // العلامات الخاصة بالمنتج (Tags)
      },
    ],
    variants: [
      {
        variantId: String, // معرف الخيار في المنصة
        title: String, // اسم الخيار (مثل الحجم أو اللون)
        price: Number, // السعر الخاص بالخيار
        stock: Number, // الكمية المتوفرة للخيار
      },
    ],
    storeURL: {
      type: String,
      required: true, // رابط المتجر الذي ينتمي إليه المنتج
    },
    createdAt: {
      type: Date,
      default: Date.now, // تاريخ استيراد المنتج
    },
  },
  { timestamps: true }
);

const productModel =
  mongoose.models.productModel || mongoose.model("Product", productSchema);
export default productModel;
