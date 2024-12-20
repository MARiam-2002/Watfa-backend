import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64"); // Load the key from .env
const IV_LENGTH = 16;

// Encryption function
export function encrypt(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decryption function
 export function decrypt(encryptedData) {
  const [iv, encrypted] = encryptedData.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Card schema
const cardSchema = new mongoose.Schema(
  {
    cardHolderName: {
      type: String,
      required: [true, "Card holder name is required"],
      minlength: [3, "Card holder name must be at least 3 characters"],
      maxlength: [100, "Card holder name cannot exceed 100 characters"],
    },
    cardNumber: {
      type: String,
      required: [true, "Card number is required"],
      unique: true,
    },
    last4: {
      type: String,
      required: [true, "The last 4 digits of the card are required"],
    },
    cardType: {
      type: String,
      enum: ["Visa", "MasterCard", "American Express", "Discover", "Other"], // Add more types if needed
      default: "Other",
    },
    expireDate: {
      type: String,
      required: [true, "Expire date is required"],
      match: [
        /^(0[1-9]|1[0-2])\/[0-9]{2}$/,
        "Expire date must be in MM/YY format",
      ],
    },
    cvc: {
      type: String,
      required: [true, "CVC is required"],
    },
  },
  { timestamps: true }
);
cardSchema.pre("save", function (next) {
    if (this.isModified("cardNumber")) {
      if (!this.cardNumber || this.cardNumber.length < 4) {
        return next(new Error("Card number is invalid or too short"));
      }
  
      // Set last4 before encryption
      this.last4 = this.cardNumber.slice(-4);
  
      // Encrypt cardNumber
      this.cardNumber = encrypt(this.cardNumber);
  
      // Determine cardType based on the original number
      if (this.last4.startsWith("4")) {
        this.cardType = "Visa";
      } else if (this.last4.startsWith("5")) {
        this.cardType = "MasterCard";
      } else if (this.last4.startsWith("3")) {
        this.cardType = "American Express";
      } else {
        this.cardType = "Other";
      }
    }
  
    if (this.isModified("cvc")) {
      this.cvc = encrypt(this.cvc);
    }
  
    next();
  });
  
  
  



// Model export
const cardModel =
  mongoose.models.cardModel || mongoose.model("Card", cardSchema);
export default cardModel;
