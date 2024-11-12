import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as validators from "./order.validation.js";
import * as orderController from "./controller/order.js";
import express from "express";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  isValidation(validators.createOrder),
  orderController.createOrder
);

router.patch(
  "/:orderId",
  isAuthenticated,
  isValidation(validators.cancelOrder),
  orderController.cancelOrder
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderController.webhook
);

export default router;
