import authRouter from "./modules/auth/auth.router.js";
import sellerRouter from "./modules/seller/seller.router.js";
import productRouter from "./modules/product/product.router.js";
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
        secure: process.env.NODE_ENV === "production", 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24, 
      },
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session()); 
  

  app.use((req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; 
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

  app.use("/auth", authRouter);
  app.use("/seller", sellerRouter); 
  app.use("/product", productRouter); 
 

  app.all("*", (req, res, next) => {
    return next(new Error("not found page", { cause: 404 }));
  });

  app.use(globalErrorHandling);
};
