import mongoose, { Schema, Types, model } from "mongoose";
const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      min: 1,
      max: 100,
      required: true,
    },
    expiredAt: Number,
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const couponModel =
  mongoose.models.couponModel || model("Coupon", couponSchema);
export default couponModel;
