import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import tokenModel from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token = req.headers["token"];

  if (!token) {
    return next(new Error("valid token is required"));
  }

  const decode = jwt.verify(token, process.env.TOKEN_KEY);
  if (!decode) {
    return next(new Error("Invalid-token"));
  }

  const tokenDB = await tokenModel.findOne({ token, isValid: true });

  if (!tokenDB) {
    return next(new Error("Token expired!"));
  }

  const user = await userModel.findOne({ email: decode.email });

  if (!user) {
    return next(new Error("user not found!"));
  }

  req.user = user;
  return next();
});
