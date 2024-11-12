import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 15,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "categoryId",
});

const categoryModel =
  mongoose.models.categoryModel || model("Category", categorySchema);

export default categoryModel;
