import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createProduct = joi
  .object({
    name: joi.string().min(2).max(20).required(),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1).max(100),
    category: joi.string().custom(isValidObjectId).required(),
    subCategory: joi.string().custom(isValidObjectId).required(),
    defaultImage: joi
      .array()
      .items(
        joi.object({
          size: joi.number().positive().required(),
          path: joi.string().required(),
          filename: joi.string().required(),
          destination: joi.string().required(),
          mimetype: joi.string().required(),
          encoding: joi.string().required(),
          originalname: joi.string().required(),
          fieldname: joi.string().required(),
        })
      )
      .length(1)
      .required(),
    subImages: joi
      .array()
      .items(
        joi.object({
          size: joi.number().positive().required(),
          path: joi.string().required(),
          filename: joi.string().required(),
          destination: joi.string().required(),
          mimetype: joi.string().required(),
          encoding: joi.string().required(),
          originalname: joi.string().required(),
          fieldname: joi.string().required(),
        })
      )
      .max(5),
  })
  .required();
export const productId = joi
  .object({
    productId: joi.string().custom(isValidObjectId),
  })
  .required();
