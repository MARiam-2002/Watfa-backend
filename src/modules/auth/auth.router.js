import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import passportFace from "../../../config/passport.facebook.js";
import passport from "../../../config/passport.sttup.js";
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
    const role = req.query.role || "buyer"; // تعيين دور افتراضي
    req.session.role = role; // تخزين الدور في الجلسة
    next();
  },
  passportFace.authenticate("facebook", { scope: ["email", "public_profile"] }) // تحديد الأذونات المطلوبة
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
      process.env.TOKEN_KEY
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

router.get(
  "/google",
  (req, res, next) => {
    const role = req.query.role || "buyer"; // تعيين دور افتراضي
    // يمكنك تخزين الدور في التوكن مباشرة بدلاً من الجلسة إذا كنت تعتمد على JWT فقط
    req.session.role = role; // تخزين الدور في الجلسة (إذا كنت لا تستخدم JWT فقط، يمكنك إلغاء هذا)
    next();
  },
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/user.phonenumbers.read", // صلاحية رقم الهاتف
      "https://www.googleapis.com/auth/user.addresses.read",  // صلاحية العنوان
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }), // يمكن إضافة توجيه خاص بالفشل مثل: failureRedirect: "/auth/error"
  (req, res) => {
    // توليد التوكن JWT
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        userName: req.user.userName,
        role: req.session.role || "buyer", // التحقق من وجود دور في الجلسة
      },
      process.env.TOKEN_KEY, // تأكد من تعيين هذا المفتاح في متغيرات البيئة
      { expiresIn: "1h" } // إضافة مدة صلاحية للتوكن
    );

    // إرجاع الـ user مع الـ token
    return res.status(201).json({
      success: true,
      message: "Login via Google successful",
      data: {
        email: req.user.email,
        phone: req.user.phoneNumber || "Phone number not available", // إظهار رسالة توضح أن الرقم غير متوفر
        country: req.user.country || "Country not available", // إظهار رسالة توضح أن البلد غير متوفر
        userName: req.user.userName,
        role: req.user.role,
        token, // إرسال التوكن للمستخدم
      },
    });
  }
);

export default router;
