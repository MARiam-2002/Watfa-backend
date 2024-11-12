import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createSubCategory = joi
  .object({
    name: joi.string().min(5).max(20).required(),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const updateSubCategory = joi
  .object({
    name: joi.string().min(5).max(20),
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategory: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const deleteSubCategory = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategory: joi.string().custom(isValidObjectId).required(),
  })
  .required();
