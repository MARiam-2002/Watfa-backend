import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();


router.post(
  "/register",
  isValidation(Validators.registerSchema),
  userController.register
);

router.post("/login", isValidation(Validators.loginSchema), userController.login);

//send forget password

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

router.get(
  "/allCountryWithFlag",
  userController.allCountryWithFlag
)


export default router;
