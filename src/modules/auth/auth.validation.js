import joi from "joi";

export const registerSchema = joi
  .object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    role: joi.string().valid("admin", "user").required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();

export const activateSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const forgetCode = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const resetPassword = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    forgetCode: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
