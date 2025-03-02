import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

// Sub-Schemas
const legalInfoSchema = new Schema(
  {
    freelancerLicenseNumber: String,
    legalCompanyName: String,
    website: String,
    nationalID: String,
    nationality: String,
    VAT: Boolean,
    address: String,
    uploadedDocuments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const bankInfoSchema = new Schema(
  {
    iban: {
      type: String,
      validate: {
        validator: (v) => /^[A-Z0-9]{15,34}$/.test(v),
        message: (props) => `${props.value} is not a valid IBAN!`,
      },
    },
    beneficiaryName: String,
    swiftCode: String,
    ibanLetterUrl: String,
    emailForSettlement: { type: String, match: /^\S+@\S+\.\S+$/ },
  },
  { timestamps: true }
);

const platformIntegrationSchema = new Schema(
  {
    platformName: {
      type: String,
      required: true,
      enum: [
        "Shopify",
        "Salla",
        "WooCommerce",
        "Direct",
        "Other", // إضافة خيار "Other" للمنصات غير المعروفة
      ],
    },
    storeURL: { type: String, required: true },
    apiKey: { type: String, default: null },
    secretKey: { type: String, default: null },
    accessToken: { type: String, default: null },
    additionalInfo: { type: Map, of: String },
  },
  { timestamps: true }
);

// Main Seller Schema
const sellerSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phoneNumber: {
      type: String,
    },
    password: { type: String, required: true },
    profileDetails: {
      companyName: String,
      businessType: {
        type: String,
        enum: ["Registered Business", "Freelancer", "Other"],
      },
      operationsCountry: String,
      productsOrServices: {
        type: String,
        enum: [
          "Fashion",
          "Beauty",
          "Skincare",
          "Health",
          "Technology & Electronics",
          "Games",
          "Restaurants",
          "Travel",
          "Furniture & Decor",
          "Sports",
          "Cosmetics",
          "Bags",
          "Accessories",
          "Supermarket",
          "Books & Magazines",
          "Cars & Motorcycles",
        ],
      },
      storeLink: String,
      platforms: [platformIntegrationSchema],
      legalInfo: legalInfoSchema,
      bankInfo: bankInfoSchema,
    },
    accountStatus: {
      type: String,
      enum: ["Active", "Pending", "Suspended"],
      default: "Pending",
    },
    legalComplete: { type: Boolean, default: false },
    bankComplete: { type: Boolean, default: false },
    platformComplete: { type: Boolean, default: false },
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    logo:{
      type: String,
      default: "https://res.cloudinary.com/dj7k9bpa8/image/upload/v1632834887/placeholder.png",
    }
  },

  { timestamps: true }
);

// Pre-Save Hook for Password Hashing
sellerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      Number(process.env.SALT_ROUND)
    );
  }
  next();
});

// Model Export
const sellerModel =
  mongoose.models.sellerModel || mongoose.model("Seller", sellerSchema);
export default sellerModel;
