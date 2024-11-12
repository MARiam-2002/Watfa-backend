import joi from "joi";

export const createCoupon = joi
  .object({
    discount: joi.number().min(1).max(100).required(),
    expiredAt: joi.date().greater(Date.now()).required(),
  })
  .required();

export const updateCoupon = joi
  .object({
    discount: joi.number().min(1).max(100),
    expiredAt: joi.date().greater(Date.now()),
    code: joi.string().length(5).required(),
  })
  .required();

export const deleteCoupon = joi
  .object({
    code: joi.string().length(5).required(),
  })
  .required();
