import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCategory = joi
  .object({
    name: joi.string().min(4).max(15).required(),
  })
  .required();

export const updateCategory = joi
  .object({
    name: joi.string().min(4).max(15),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const deleteCategory = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
