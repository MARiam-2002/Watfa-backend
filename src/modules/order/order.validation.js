import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createOrder = joi
  .object({
    address: joi.string().min(10).required(),
    coupon: joi.string().length(5),
    phone: joi
      .string()
      .regex(/^(01|00201)[0-2,5]{1}[0-9]{8}/)
      .length(11)
      .required(),
    payment: joi.string().valid("visa", "cash").required(),
  })
  .required();

export const cancelOrder = joi
  .object({
    orderId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
