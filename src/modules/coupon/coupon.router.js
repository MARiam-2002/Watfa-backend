import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as couponController from "../coupon/controller/coupon.js";
import * as Validators from "./coupon.validation.js";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValidation(Validators.createCoupon),
  couponController.createCoupon
);
router.patch(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValidation(Validators.updateCoupon),
  couponController.updateCoupon
);
router.delete(
  "/:code",
  isAuthenticated,
  isAuthorized("admin"),
  isValidation(Validators.deleteCoupon),
  couponController.deleteCoupon
);
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  couponController.allCoupons
);
export default router;
