import joi from "joi";

export const registerSchema = joi
  .object({
    userName: joi
      .string()
      .regex(/^[a-zA-Z0-9._]+$/)
      .trim()
      .min(5)
      .max(15)
      .messages({
        "string.base": "Username must be a string.",
        "string.empty": "User name is required",
        "string.min": "User name must be at least 5 characters long",
        "string.max": "User name must be at most 15 characters long",
        "string.pattern.base":
          "User name can only contain alphanumeric characters, periods, and underscores",
        "any.required": "Username is required.",
      })
      .required(),
    role: joi
      .string()
      .valid("bayer", "seller")
      .messages({
        "string.base": "Role must be a string.",
        "string.empty": "Role is required",
        "any.only": "Role must be either 'bayer' or 'seller'",
        "any.required": "Role is required",
      })
      .required(),
    phoneNumber: joi
      .string()
      .pattern(/^((\+966|0)?5\d{8})$/)
      .when("role", {
        is: "seller",
        then: joi.required().messages({
          "string.pattern.base":
            "Phone number must be a valid Saudi number starting with +966 or 05 and contain 9 digits.",
          "string.empty": "Phone number is required for sellers.",
          "any.required": "Phone number is required for sellers.",
        }),
        otherwise: joi.optional(),
      }),
    email: joi
      .string()
      .email()
      .messages({
        "string.email": "Invalid email address",
        "string.empty": "Email cannot be empty.",
        "any.required": "Email is required.",
      })
      .required(),
    password: joi
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .message({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "string.empty": "Password cannot be empty.",
        "any.required": "Password is required.",
      })
      .required(),
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
export const verify = joi
  .object({
    forgetCode: joi
      .string()
      .messages({
        "string.empty": "Forget code cannot be empty.",
        "any.required": "Forget code is required.",
      })
      .required(),
  })
  .required();
