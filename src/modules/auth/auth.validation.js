import joi from "joi";

const defaultMessages = {
  "string.base": "{#label} يجب أن يكون نصًا.",
  "string.empty": "{#label} مطلوب ولا يمكن أن يكون فارغًا.",
  "string.min": "{#label} يجب أن يكون على الأقل {#limit} أحرف.",
  "string.max": "{#label} يجب ألا يزيد عن {#limit} أحرف.",
  "string.pattern.base": "{#label} يحتوي على تنسيق غير صالح.",
  "any.required": "{#label} مطلوب.",
  "any.only": "{#label} يجب أن يكون من القيم المسموح بها.",
  "string.email": "البريد الإلكتروني غير صالح، يرجى إدخال بريد إلكتروني صحيح.",
};

export const registerSchema = joi
  .object({
    email: joi
      .string()
      .email()
      .required()
      .messages({
        "string.empty": "البريد الإلكتروني مطلوب.",
        "string.email": "يرجى إدخال بريد إلكتروني صحيح.",
        "any.required": "البريد الإلكتروني مطلوب.",
      }),

    userName: joi
      .string()
      .required()
      .messages({
        "string.empty": "اسم المستخدم مطلوب.",
        "any.required": "اسم المستخدم مطلوب.",
      }),

    role: joi
      .string()
      .valid("buyer", "seller")
      .required()
      .messages({
        "any.only": "الدور يجب أن يكون إما 'buyer' أو 'seller'.",
        "any.required": "الدور مطلوب.",
      }),

    phoneNumber: joi
      .string()
      .when("role", {
        is: "seller",
        then: joi
          .required()
          .messages({
            "string.empty": "رقم الهاتف مطلوب للبائع.",
            "string.pattern.base":
              "رقم الهاتف يجب أن يكون رقمًا سعوديًا يبدأ بـ +966 أو 05 ويحتوي على 9 أرقام.",
            "any.required": "رقم الهاتف مطلوب للبائع.",
          }),
      }),

    password: joi
      .string()
      .regex(/^(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>])(?=.{8,}).*$/)
      .required()
      .messages({
        "string.empty": "كلمة المرور مطلوبة.",
        "string.pattern.base":
          "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتحتوي على حرف كبير واحد على الأقل، ويجب أن تتضمن رقمًا أو رمزًا خاصًا.",
        "any.required": "كلمة المرور مطلوبة.",
      }),

    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "string.empty": "تأكيد كلمة المرور مطلوب.",
        "any.only": "تأكيد كلمة المرور يجب أن يتطابق مع كلمة المرور الجديدة.",
        "any.required": "تأكيد كلمة المرور مطلوب.",
      }),

    country: joi
      .string()
      .required()
      .messages({
        "string.empty": "الدولة مطلوبة.",
        "any.required": "الدولة مطلوبة.",
      }),
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
