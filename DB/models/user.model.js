import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    companyName: { type: String },

    userName: {
      type: String,
      unique: true,

      min: 3,
      max: 20,
    },
    phoneNumber: { type: String },
    document: {
      url: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    country: { type: String },
    businessType: { type: String, enum: ["Registered Business", "Freelancer"] },
    services: { type: [String], enum: ["In-Store", "Online"] },
    fingerprint: { type: String },
    faceData: { type: String },
    googleId: String,
    facebookId: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    wishlist: [
      {
        type: Types.ObjectId,
        ref: "Product", // تأكد من أن لديك موديل "Product"
      },
    ],
        cards: [
      {
        type: Types.ObjectId,
        ref: "Card",
      },
    ],
    forgetCode: String,
    activationCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dz5dpvxg7/image/upload/v1691521498/ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc.png",
      },
      id: {
        type: String,
        default:
          "ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc",
      },
    },
    coverImages: [
      {
        url: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.models.userModel || model("User", userSchema);
export default userModel;
