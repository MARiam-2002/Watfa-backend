import { Types } from "mongoose";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid ObjectId");
};

export const isValidation = (Schema) => {
  return (req, res, next) => {
    const copyReq = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...req.files,
    };

    const validationResult = Schema.validate(copyReq, { abortEarly: false });

    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(
        (error) => error.message
      );

      // إعادة الخطأ بشكل استجابة JSON مع الحالة 400
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    // إذا لم يكن هناك خطأ، متابعة الطلب
    return next();
  };
};

