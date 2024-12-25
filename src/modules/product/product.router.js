import { Router } from "express";
import * as productController from "./controller/product.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/fetch-products", productController.fetchProductsFromPlatform);

export default router;
