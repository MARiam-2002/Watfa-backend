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
      return next(new Error(errorMessages), { cause: 400 });
    }
    return next();
  };
};
