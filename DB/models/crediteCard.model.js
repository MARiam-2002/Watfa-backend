import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64"); // Load the key from .env
const IV_LENGTH = 16;

// Luhn Algorithm for card number validation
export function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;
  // Traverse the card number from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9; // If the result is greater than 9, subtract 9
    }
    sum += digit;
    shouldDouble = !shouldDouble; // Toggle the shouldDouble flag
  }
  return sum % 10 === 0; // Return true if the sum is divisible by 10
}

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

// دالة للتحقق من تكرار رقم البطاقة
const isCardNumberDuplicate = async function (cardNumber) {
  const cards = await cardModel.find();
  for (const card of cards) {
    if (decrypt(card.cardNumber) === cardNumber) {
      return true;
    }
  }
  return false;
};

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

cardSchema.pre("save", async function (next) {
  if (this.isModified("cardNumber")) {
    // تحقق من الرقم باستخدام خوارزمية Luhn قبل التشفير
    if (
      !luhnCheck(this.cardNumber) ||
      this.cardNumber.length < 14 ||
      this.cardNumber.length > 16
    ) {
      return next(new Error("Invalid card number"));
    }

    // تحقق من عدم تكرار رقم البطاقة
    const isDuplicate = await isCardNumberDuplicate(this.cardNumber);
    if (isDuplicate) {
      return next(new Error("Card number is already in use"));
    }

    // استخراج آخر 4 أرقام قبل التشفير
    this.last4 = this.cardNumber.slice(-4);

    // تحديد نوع البطاقة
    if (this.cardNumber.startsWith("4")) {
      this.cardType = "Visa";
    } else if (this.cardNumber.startsWith("5")) {
      this.cardType = "MasterCard";
    } else if (this.cardNumber.startsWith("34") || this.cardNumber.startsWith("37")) {
      this.cardType = "American Express";
    } else if (this.cardNumber.startsWith("30") || this.cardNumber.startsWith("36") || this.cardNumber.startsWith("38")) {
      this.cardType = "Diners Club";
    } else {
      this.cardType = "Other";
    }
    
    
    

    // تشفير الرقم بعد استخراج الـ last4
    this.cardNumber = encrypt(this.cardNumber);
  }

  if (this.isModified("cvc")) {
    // تشفير CVC
    this.cvc = encrypt(this.cvc);
  }

  next();
});

// Model export
const cardModel =
  mongoose.models.cardModel || mongoose.model("Card", cardSchema);
export default cardModel;
