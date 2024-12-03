export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // إذا لم يتم إرسال استجابة بعد، مرر الخطأ إلى Middleware الأخطاء
      if (!res.headersSent) {
        next(
          new Error(error.message || "Internal Server Error", { cause: 500 })
        );
      } else {
        console.error("Error response has already been sent.");
      }
    });
  };
};

export const globalErrorHandling = (error, req, res, next) => {
  if (!res.headersSent) {
    const statusCode = error.cause || 500; // الحالة الافتراضية 500 إذا لم يتم تحديد سبب
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // إظهار الـ stack فقط في وضع التطوير
    });
  } else {
    console.error("Error response has already been sent.");
    next(error); // تمرير الخطأ في حال تم إرسال الاستجابة مسبقًا
  }
};
