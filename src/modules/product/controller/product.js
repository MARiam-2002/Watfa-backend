import categoryModel from "../../../../DB/models/category.model.js";
import productModel from "../../../../DB/models/product.model.js";
import subCategoryModel from "../../../../DB/models/subcategory.model.js";
import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import cloudinary from "../../../utils/cloud.js";
import { nanoid } from "nanoid";
export const createProduct = async (req, res, next) => {
  //   const {
  //     name,
  //     description,
  //     availableItems,
  //     price,
  //     discount,
  //     brand,
  //     category,
  //     subCategory,
  //   } = req.body;

  const category = await categoryModel.findById(req.body.category);
  if (!category) {
    return next(new Error("Category not found!", { cause: 404 }));
  }

  const subCategory = await subCategoryModel.findById(req.body.subCategory);
  if (!subCategory) {
    return next(new Error("SubCategory not found!", { cause: 404 }));
  }

  if (!req.files) {
    return next(new Error("product images is required", { cause: 400 }));
  }
  const cloudFolder = nanoid();
  let images = [];
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUDINARY}/products/${cloudFolder}` }
    );
    images.push({ url: secure_url, id: public_id });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    {
      folder: `${process.env.FOLDER_CLOUDINARY}/products/${cloudFolder}`,
    }
  );

  const product = await productModel.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    image: images,
  });

  return res.status(201).json({ success: true, result: product });
};

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) {
    return next(new Error("product not found", { cause: 404 }));
  }

  // if (req.user._id.toString() !== product.createdBy.toString()) {
  //   return next(new Error("not authorized", { cause: 401 }));
  // }
  const ids = product.image.map((image) => image.id);
  ids.push(product.defaultImage.id);
  const result = await cloudinary.api.delete_resources(ids);
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUDINARY}/products/${product.cloudFolder}`
  );

  await productModel.findByIdAndDelete(req.params.productId);
  return res
    .status(200)
    .json({ success: true, message: "product delete successfully!" });
});
export const category = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  const products = await productModel.find({
    category: req.params.categoryId,
  });
  return res.status(200).json({ success: true, result: products });
});
export const subCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await subCategoryModel.findById(req.params.subCategory);
  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));
  const products = await productModel.find({
    subCategory: req.params.subCategory,
  });
  return res.status(200).json({ success: true, result: products });
});

export const getallProduct = asyncHandler(async (req, res, next) => {
  const products = await productModel
    .find({ ...req.query })
    .pagination(req.query.page)
    .customSelect(req.query.fields)
    .sort(req.query.sort);
  return res.status(200).json({ success: true, result: products });
});
export const getProduct = asyncHandler(async (req, res, next) => {
  const products = await productModel.findById(req.params.productId);
  if (!products) {
    return next(new Error("product not found", { cause: 404 }));
  }
  return res.json({ success: true, result: products });
});

export const redHeart = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) {
    return next(new Error("product not found", { cause: 404 }));
  }
  if (product.favourite) {
    return next(new Error("already added to wishlist", { cause: 400 }));
  }
  product.favourite = true;
  await product.save();

  const user = await userModel.findById(req.user._id);
  user.wishlist.push(product._id);
  await user.save();
  return res.status(200).json({
    success: true,
    message: "This product has been added to the wishlist",
    result: product,
  });
});
export const wishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);

  return res.status(200).json({
    success: true,
    message: "These are all the products that you added to the wishlist",
    results: user.wishlist,
  });
});

export const deleteWishlist = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  product.favourite = false;
  await product.save();
  const user = await userModel.findById(req.user._id);
  user.wishlist.pop(req.params.productId);
  await user.save();
  return res.status(200).json({
    success: true,
    message: "success delete product from wishlist ",
  });
});
