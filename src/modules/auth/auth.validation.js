import joi from "joi";

const defaultMessages = {
  "string.base": "{#label} must be a string.",
  "string.empty": "{#label} cannot be empty.",
  "string.min": "{#label} must be at least {#limit} characters long.",
  "string.max": "{#label} must be at most {#limit} characters long.",
  "string.pattern.base": "{#label} format is invalid.",
  "any.required": "{#label} is required.",
  "any.only": "{#label} must match one of the allowed values.",
  "string.email": "{#label} must be a valid email address.",
};

export const registerSchema = joi
  .object({
    email: joi
      .string()
      .email()
      .required()
      .label("Email")
      .messages(defaultMessages),
    userName: joi
      .string()
      .required()
      .label("Username")
      .messages(defaultMessages),

    role: joi
      .string()
      .valid("buyer", "seller")
      .required()
      .label("Role")
      .messages(defaultMessages),

    phoneNumber: joi
      .string()
      .when("role", {
        is: "seller",
        then: joi
          .required()
          .label("Phone Number")
          .messages({
            ...defaultMessages,
            "string.pattern.base":
              "Phone number must be a valid Saudi number starting with +966 or 05 and contain 9 digits.",
          }),
      })
      .messages(defaultMessages),

    password: joi
      .string()
      .regex(/^(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>])(?=.{8,}).*$/)
      .required()
      .label("Password")
      .messages({
        ...defaultMessages,
        "string.pattern.base":
          "Password must be at least 8 characters long, contain at least one uppercase letter, and include either a number or a special character.",
      }),

    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .label("Confirm Password")
      .messages({
        ...defaultMessages,
        "any.only": "Confirm Password must match the New Password.",
      }),

    country: joi.string().required().label("Country").messages(defaultMessages),
  })
  .required();

export const loginSchema = joi
  .object({
    email: joi
      .string()
      .email()
      .required()
      .label("Email")
      .messages(defaultMessages),

    password: joi
      .string()
      .regex(/^(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>])(?=.{8,}).*$/)
      .required()
      .label("Password")
      .messages({
        ...defaultMessages,
        "string.pattern.base":
          "Password must be at least 8 characters long, contain at least one uppercase letter, and include either a number or a special character.",
      }),
  })
  .required();

export const forgetCode = joi
  .object({
    email: joi
      .string()
      .email()
      .required()
      .label("Email")
      .messages(defaultMessages),
  })
  .required();

export const resetPassword = joi
  .object({
    password: joi
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .required()
      .label("Password")
      .messages({
        ...defaultMessages,
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      }),

    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .label("Confirm Password")
      .messages({
        ...defaultMessages,
        "any.only": "Confirm Password must match the New Password.",
      }),
  })
  .required();

export const verify = joi
  .object({
    forgetCode: joi
      .string()
      .required()
      .label("Forget Code")
      .messages(defaultMessages),
  })
  .required();
  export const cardValidationSchema = joi
  .object({
    cardHolderName: joi
      .string()
      .required()
      .min(3)
      .max(100)
      .label("Card Holder Name")
      .messages({
        ...defaultMessages,
        "string.base": "Card holder name must be a string.",
        "string.empty": "Card holder name cannot be empty.",
        "string.min": "Card holder name must be at least {#limit} characters long.",
        "string.max": "Card holder name must be at most {#limit} characters long.",
      }),

    cardNumber: joi
      .string()
      .required()
      .creditCard()
      .label("Card Number")
      .messages({
        ...defaultMessages,
        "string.empty": "Card number cannot be empty.",
        "string.pattern.base": "Card number must be a valid credit card number.",
      }),

    expireDate: joi
      .string()
      .required()
      .pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)
      .label("Expiration Date (MM/YY)")
      .messages({
        ...defaultMessages,
        "string.empty": "Expiration date cannot be empty.",
        "string.pattern.base": "Expiration date must follow MM/YY format.",
      }),

    cvc: joi
      .string()
      .required()
      .pattern(/^[0-9]{3,4}$/)
      .label("CVC")
      .messages({
        ...defaultMessages,
        "string.empty": "CVC cannot be empty.",
        "string.pattern.base": "CVC must be 3 or 4 digits.",
      }),
  })
  .required();
