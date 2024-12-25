const notificationSchema = new Schema(
    {
      seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
      type: {
        type: String,
        enum: ["OrderUpdate", "PayoutUpdate", "SystemAlert"],
        required: true,
      },
      message: { type: String, required: true },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  
  const notificationModel =
    mongoose.models.notificationModel ||
    mongoose.model("Notification", notificationSchema);
  export default notificationModel;
  