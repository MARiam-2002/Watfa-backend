import { Router } from "express";
import * as categoryController from "./controller/category.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as validators from "./category.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import subCategoryRouter from "../subcategory/subcategory.router.js";

import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

router.post(
  "/createCategory",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValidation(validators.createCategory),
  categoryController.createCategory
);

router.patch(
  "/update/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValidation(validators.updateCategory),
  categoryController.updateCategory
);

router.use("/:categoryId/subCategory", subCategoryRouter);

router.delete(
  "/delete/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValidation(validators.deleteCategory),
  categoryController.deleteCategory
);

router.get("/getAllCategory", categoryController.getAllCategory);

export default router;
