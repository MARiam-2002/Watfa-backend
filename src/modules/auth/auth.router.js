import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import passport from "passport";
const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/login/failed", (req, res, next) => {
  res.status(401).json({ error: true, message: "login failure" });
});
router.get("/login/success", async (req, res, next) => {
  if (req.user) {
    req.user.status = "online";
    await req.user.save();
    return res
      .status(200)
      .json({ error: false, message: "Successfully Login", user: req.user });
  } else {
    return res.status(403).json({ error: true, message: "not Authorized" });
  }
});
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: "http://backend-kappa-beige.vercel.app/auth/login/success",
    failureRedirect: "http://backend-kappa-beige.vercel.app/auth/login/failed",
  })
);
router.post(
  "/register",
  isValidation(Validators.registerSchema),
  userController.register
);

router.get(
  "/confirmEmail/:activationCode",
  isValidation(Validators.activateSchema),
  userController.activationAccount
);

router.post("/login", isValidation(Validators.login), userController.login);

//send forget password

router.patch(
  "/forgetCode",
  isValidation(Validators.forgetCode),
  userController.sendForgetCode
);
router.patch(
  "/resetPassword",
  isValidation(Validators.resetPassword),
  userController.resetPasswordByCode
);
export default router;
