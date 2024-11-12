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
import pass from "../config/passport.sttup.js";
import session from "express-session";

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV == "dev") {
    app.use(morgan("common"));
  }

  // const whiteList = ["http://127.0.0.1:5500",undefined];

  // app.use((req, res, next) => {
  //   if (req.originalUrl.includes("/auth/confirmEmail")) {
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Access-Control-Allow-Methods", "GET");
  //     return next();
  //   }
  //   if (!whiteList.includes(req.header("origin"))) {
  //     return next(new Error("Blocked By CORS!"));
  //   }
  //   res.setHeader("Access-Control-Allow-Origin", "*");
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  //   res.setHeader("Access-Control-Allow-Private-Network", true);
  //   return next();
  // });
  // app.use((req, res, next) => {
  //   console.log(req.originalUrl);
  //   if (req.originalUrl == "/order/webhook") {
  //     next();
  //   } else {
  //     express.json()(req, res, next);
  //   }
  // });
  app.use(cors());
  app.use(express.json());
  app.use(
    session({ secret: "secret", resave: true, saveUninitialized: true })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/auth", authRouter);
  app.use("/category", categoryRouter);
  app.use("/subCategory", subCategoryRouter);
  app.use("/product", productRouter);
  app.use("/about", aboutRouter);
  app.use("/coupon", couponRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.all("*", (req, res, next) => {
    console.log(3);
    return next(new Error("not found page", { cause: 404 }));
  });

  app.use((error, req, res, next) => {
    return res.json({ message: error.message, stack: error.stack });
  });
  app.use(globalErrorHandling);
};
