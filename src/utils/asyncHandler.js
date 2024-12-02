export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (!res.headersSent) {
        return next(
          new Error(error.message || "Internal Server Error", { cause: 500 })
        );
      }
    });
  };
};

export const globalErrorHandling = (error, req, res, next) => {
  if (!res.headersSent) {
    return res.status(error.cause || 400).json({
      msgError: error.message,
      stack: error.stack,
    });
  } else {
    console.error("Error response has already been sent.");
    return next(error);
  }
};
