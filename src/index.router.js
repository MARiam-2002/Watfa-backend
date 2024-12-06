import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subCategoryRouter from "./modules/subcategory/subcategory.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import aboutRouter from "./modules/about/about.router.js";
import { globalErrorHandling } from "./utils/asyncHandler.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import jwt from "jsonwebtoken";
import session from "express-session";

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV == "dev") {
    app.use(morgan("common"));
  }

  // استخدام CORS للتمكين من الوصول من مصادر مختلفة
  app.use(cors());

  // استخدم Express JSON لتحليل البيانات
  app.use(express.json());

  // لا حاجة لاستخدام express-session لأنك ستعتمد على JWT بدلاً منها
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET, 
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       secure: process.env.NODE_ENV === "production", 
  //       httpOnly: true, 
  //       maxAge: 1000 * 60 * 60 * 24, 
  //     },
  //   })
  // );
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production", // true إذا كنت تستخدم HTTPS
        httpOnly: true, // لمنع الوصول إليها من خلال JavaScript
        maxAge: 1000 * 60 * 60 * 24, // عمر الكوكيز (مثال: يوم واحد)
      },
    })
  );
  
  // تفعيل Passport مع الجلسات
  app.use(passport.initialize());
  app.use(passport.session()); // تفعيل الجلسات مع Passport
  

  // إضافة وظيفة للتحقق من التوكن JWT على المسارات المحمية
  app.use((req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // الحصول على التوكن من الرأس
    if (token) {
      jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded; // إضافة بيانات المستخدم من التوكن إلى الطلب
        next();
      });
    } else {
      next();
    }
  });

  // إضافة المسارات
  app.use("/auth", authRouter);
  app.use("/category", categoryRouter);
  app.use("/subCategory", subCategoryRouter);
  app.use("/product", productRouter);
  app.use("/about", aboutRouter);
  app.use("/coupon", couponRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);

  // مسار غير موجود
  app.all("*", (req, res, next) => {
    console.log(3);
    return next(new Error("not found page", { cause: 404 }));
  });

  // إضافة التعامل مع الأخطاء العالمية (كما هو معرف في asyncHandler.js)
  app.use(globalErrorHandling);
};
