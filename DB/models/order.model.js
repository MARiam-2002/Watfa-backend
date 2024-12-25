import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    items: [
      {
        productName: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "SAR" },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled", "Refunded"],
      default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const orderModel =
  mongoose.models.orderModel || mongoose.model("Order", orderSchema);
export default orderModel;
