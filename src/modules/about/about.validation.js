import joi from "joi";

const aboutValidation = joi
  .object({
    name: joi.string().min(5).max(20).required(),
    email: joi.string().email().required(),
    phone: joi
      .string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .required(),
    message: joi.string().min(4).max(300).required(),
  })
  .required();

export default aboutValidation;
