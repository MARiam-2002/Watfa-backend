import { Router } from "express";
import * as sellerController from "./controller/seller.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/register", sellerController.registerSeller);

router.patch(
  "/update-seller-profile",
  isAuthenticated,
  sellerController.UpdateSellerProfile
);

router.post("/connect",isAuthenticated,sellerController.connectPlatform);

export default router;
