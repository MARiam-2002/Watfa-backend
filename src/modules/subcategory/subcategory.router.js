import { Router } from "express";
import * as validators from "./subcategory.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isValidation } from "../../middleware/validation.middleware.js";

import * as subCategoryController from "../subcategory/controller/subcategory.js";
const router = Router({ mergeParams: true });

router.post(
  "/addSubcategory",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subCategory"),
  isValidation(validators.createSubCategory),
  subCategoryController.createSubCategory
);

router.patch(
  "/:subcategory",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subCategory"),
  isValidation(validators.updateSubCategory),
  subCategoryController.updateSubCategory
);

router.delete(
  "/:subcategory",
  isAuthenticated,
  isAuthorized("admin"),
  isValidation(validators.deleteSubCategory),
  subCategoryController.deleteSubCategory
);

router.get("/getAllSubcategory", subCategoryController.getAllSubcategory);

export default router;
