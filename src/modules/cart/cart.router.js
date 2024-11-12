import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as cartController from "./controller/cart.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as validators from "./cart.validation.js";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  isValidation(validators.cartSchema),
  cartController.addProductInCart
);
router.get("/", isAuthenticated, cartController.getProductInCart);

router.patch("/clear", isAuthenticated, cartController.clearCart);
router.patch(
  "/",
  isAuthenticated,
  isValidation(validators.cartSchema),
  cartController.updateCart
);
router.patch(
  "/:productId",
  isAuthenticated,
  isValidation(validators.removeProductFromCart),
  cartController.removeProductFromCart
);

export default router;
