import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 5,
      max: 20,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const subCategoryModel =
  mongoose.models.subCategoryModel || model("Subcategory", subCategorySchema);

export default subCategoryModel;
