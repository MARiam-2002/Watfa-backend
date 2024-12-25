import mongoose, { Schema } from "mongoose";

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
    platformName: { type: String, required: true },
    storeURL: { type: String, required: true },
    apiKey: { type: String, default: null },
    secretKey: { type: String, default: null },
    accessToken: { type: String, default: null },
    additionalInfo: { type: Map, of: String }, // لتخزين بيانات إضافية حسب الحاجة
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
      match: /^[0-9]{10,15}$/,
    },
    password: { type: String, required: true },
    profileDetails: {
      companyName: String,
      businessType: {
        type: String,
        enum: ["Registered Business", "Freelancer", "Other"],
      },
      operationsCountry: String,
      productsOrServices: String,
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
  },

  { timestamps: true }
);

// Pre-Save Hook for Password Hashing
sellerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const bcrypt = require("bcrypt");
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Model Export
const sellerModel =
  mongoose.models.sellerModel || mongoose.model("Seller", sellerSchema);
export default sellerModel;
