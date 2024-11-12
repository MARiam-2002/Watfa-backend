import slugify from "slugify";
import categoryModel from "../../../../DB/models/category.model.js";
import subCategoryModel from "../../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import cloudinary from "../../../utils/cloud.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }
  const category = await categoryModel.findById(categoryId);

  if (!category) {
    return next(new Error("category not found", { cause: 404 }));
  }
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUDINARY}/subcategory`,
    }
  );
  const subcategory = await subCategoryModel.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createBy: req.user._id,
    image: {
      id: public_id,
      url: secure_url,
    },
    categoryId,
  });
  return res.status(201).json({ success: true, results: subcategory });
});

export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);

  if (!category) {
    return next(new Error("category not found", { cause: 404 }));
  }

  const subcategory = await subCategoryModel.findOne({
    _id: req.params.subcategory,
    categoryId: req.params.categoryId,
  });
  if (!subcategory) {
    return next(new Error("subcategory not found", { cause: 404 }));
  }

  // if (req.user._id.toString() !== subcategory.createBy.toString()) {
  //   return next(new Error("You not authorized!"));
  // }

  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;

  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: subcategory.image.id,
      }
    );
    subcategory.image.url = secure_url;
  }

  await subcategory.save();
  return res.status(201).json({
    success: true,
    message: "updated successfully",
    results: subcategory,
  });
});

export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);

  if (!category) {
    return next(new Error("category not found", { cause: 404 }));
  }

  const subcategory = await subCategoryModel.findOneAndDelete({
    _id: req.params.subcategory,
    categoryId: req.params.categoryId,
  });

  if (!subcategory) {
    return next(new Error("subcategory not found", { cause: 404 }));
  }
  // if (req.user._id.toString() !== subcategory.createBy.toString()) {
  //   return next(new Error("You not authorized!"));
  // }
  await cloudinary.uploader.destroy(subcategory.image.id);
  return res.status(201).json({
    success: true,
    message: "deleted successfully",
    results: subcategory,
  });
});

export const getAllSubcategory = asyncHandler(async (req, res, next) => {
  const subcategories = await subCategoryModel.find().populate("categoryId");
  return res.status(200).json({
    success: true,
    results: subcategories,
  });
});
