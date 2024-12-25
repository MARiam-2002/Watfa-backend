import mongoose, { Schema, Types, model } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    seller: {
      type: Types.ObjectId,
      ref: "Seller",
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    agent: String,
    expiredAt: String,
  },
  { timestamps: true }
);
 const tokenModel = mongoose.models.tokenModel || model("Token", tokenSchema);
export default tokenModel;