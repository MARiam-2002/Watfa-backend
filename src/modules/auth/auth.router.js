import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import passport from "../../../config/passport.facebook.js";
import jwt from "jsonwebtoken";
const router = Router();

router.post(
  "/register",
  isValidation(Validators.registerSchema),
  userController.register
);

router.post(
  "/login",
  isValidation(Validators.loginSchema),
  userController.login
);

router.patch(
  "/forgetCode",
  isAuthenticated,
  isValidation(Validators.forgetCode),
  userController.sendForgetCode
);

router.patch(
  "/resetPassword",
  isAuthenticated,
  isValidation(Validators.resetPassword),
  userController.resetPasswordByCode
);
router.patch(
  "/VerifyCode",
  isAuthenticated,
  isValidation(Validators.verify),
  userController.VerifyCode
);

router.get("/allCountryWithFlag", userController.allCountryWithFlag);

router.get(
  "/facebook",
  (req, res, next) => {
    const role = req.query.role || "buyer";
    req.session.role = role;
    next();
  },
  passport.authenticate("facebook", { scope: ["email", "public_profile"] }) // تحديد الأذونات المطلوبة
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        userName: req.user.userName,
        role: req.session.role || "buyer",
      },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: "Login Facebook successful",
      data: {
        email: req.user.email,
        userName: req.user.userName,
        role: req.user.role,
        token,
      },
    });
  }
);
export default router;
