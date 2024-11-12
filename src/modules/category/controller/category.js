import slugify from "slugify";
import categoryModel from "../../../../DB/models/category.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import cloudinary from "../../../utils/cloud.js";
import subCategoryModel from "../../../../DB/models/subcategory.model.js";

export const createCategory = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("image is required", { cause: 400 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUDINARY}/category`,
    }
  );

  const category = await categoryModel.create({
    name: req.body.name,
    createdBy: req.user._id,
    image: {
      id: public_id,
      url: secure_url,
    },
    slug: slugify(req.body.name),
  });

  return res.status(201).json({ success: true, results: category });
};

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new Error("category not found!", { cause: 404 }));
  }
  // if (req.user._id.toString() !== category.createdBy.toString()) {
  //   return next(new Error("You not authorized!"));
  // }
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: category.image.id,
      }
    );
    category.image.url = secure_url;
  }

  await category.save();
  return res.status(200).json({ success: true, message: "updated" });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new Error("invalid categoryId!", { cause: 404 }));
  }
  // if (req.user._id.toString() !== category.createdBy.toString()) {
  //   return next(new Error("You not authorized!"));
  // }
  await cloudinary.uploader.destroy(category.image.id);
  await categoryModel.findByIdAndDelete(req.params.categoryId);
  const subCategories = await subCategoryModel.find({
    categoryId: category._id,
  });
  subCategories.map(async (subCategory) => {
    await cloudinary.uploader.destroy(subCategory.image.id);
  });

  await subCategoryModel.deleteMany({ categoryId: category._id });

  return res.status(200).json({ success: true, message: "category delete" });
});

export const getAllCategory = asyncHandler(async (req, res, next) => {
  const allCategory = await categoryModel
    .find()
    .populate({ path: "subcategory", populate: [{ path: "createBy" }] });
  return res.status(200).json({ success: true, results: allCategory });
});
