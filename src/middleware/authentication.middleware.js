import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import tokenModel from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
import sellerModel from "../../DB/models/seller.model.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.headers["token"];
  if (!token) {
    return next(new Error("Valid token is required"));
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.TOKEN_KEY);
  } catch (error) {
    return next(new Error("Invalid token"));
  }

  const tokenDB = await tokenModel.findOne({ token, isValid: true });
  if (!tokenDB) {
    return next(new Error("Token expired or invalid!"));
  }

  const user = await userModel.findById(decode.id);
  if (user) {
    req.user = user;
    return next();
  }

  const seller = await sellerModel.findById(decode.id);
  if (seller) {
    req.seller = seller;
    return next();
  }

  return next(new Error("User not found!"));
});
