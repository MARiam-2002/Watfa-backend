const payoutSchema = new Schema(
    {
      seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: "SAR" },
      status: {
        type: String,
        enum: ["Pending", "Processing", "Completed", "Failed"],
        default: "Pending",
      },
      transactionReference: String,
      initiatedAt: { type: Date, default: Date.now },
      completedAt: Date,
    },
    { timestamps: true }
  );
  
  const payoutModel =
    mongoose.models.payoutModel || mongoose.model("Payout", payoutSchema);
  export default payoutModel;
  