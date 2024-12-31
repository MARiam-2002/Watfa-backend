import { Router } from "express";
import * as productController from "./controller/product.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/fetch-products",isAuthenticated, productController.fetchProductsFromPlatform);
router.get("/getAllCateWithProd",productController.getAllCategoriesWithProducts)
router.get("/get-all-categories",productController.getAllCategories)

export default router;
