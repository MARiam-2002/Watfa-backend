import cartModel from "../../../../DB/models/cart.model.js";
import fs from "fs";
import couponModel from "../../../../DB/models/coupon.model.js";
import orderModel from "../../../../DB/models/order.model.js";
import productModel from "../../../../DB/models/product.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { createInvoice } from "../../../utils/createinvoice.js";
import path from "path";
import url from "url";
import cloudinary from "../../../utils/cloud.js";
import { sendEmail } from "../../../utils/sendEmails.js";
import { clearCart, updateStock } from "../order.service.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const createOrder = asyncHandler(async (req, res, next) => {
  const { payment, address, phone, coupon } = req.body;
  let checkCoupon;
  if (coupon) {
    checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!checkCoupon) return next(new Error("invalid coupon!"));
  }
  const cart = await cartModel.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart!"));
  let orderProducts = [];
  let orderPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const product = await productModel.findById(products[i].productId);
    if (!product)
      return next(new Error(`product ${products[i].productId} not found!`));
    if (!product.inStock(products[i].quantity)) {
      return next(
        new Error(
          `${product.name} out of stock, only ${product.availableItems} items are left`
        )
      );
    }
    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
    });

    orderPrice += product.finalPrice * products[i].quantity;
  }
  const order = await orderModel.create({
    user: req.user._id,
    products: orderProducts,
    address,
    phone,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    payment,
    price: orderPrice,
  });
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: orderProducts,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };
  const pdfPath =
    process.env.NODE_ENV === "dev"
      ? path.join(__dirname, `../../../../invoiceTemp/${order._id}.pdf`)
      : `/tmp/${order._id}.pdf`;

  createInvoice(invoice, pdfPath);

  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUDINARY}/order/invoice/${user._id}`,
  });

  order.invoice = { id: public_id, url: secure_url };
  await order.save();

  const isSent = await sendEmail({
    to: user.email,
    subject: "order invoice",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });
  if (isSent) {
    updateStock(order.products, true);
    clearCart(user._id);
  }
  fs.unlinkSync(pdfPath);

  if (payment === "visa") {
    let existCoupon;
    if (order.coupon !== undefined) {
      existCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: { order_id: order._id.toString() },
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: { name: product.name },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: existCoupon ? [{ coupon: existCoupon.id }] : [],
    });

    return res.json({
      success: true,
      results: session.url,
    });
  }
  return res.json({
    success: true,
    message: "order placed successfully! please check yo ur email!",
  });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.orderId);
  if (!order) return next(new Error("order not found!"));
  if (order.status === "shipped" || order.status === "delivered") {
    return next(new Error("can not cancel order!"));
  }

  order.status = "canceled";
  await order.save();
  updateStock(order.products, false);

  return res.json({
    success: true,
    message: "order canceled successfully!",
  });
});

export const webhook = async (request, res) => {
  const sig = request.headers["stripe-signature"];

  let event = stripe.webhooks.constructEvent(
    request.body,
    sig,
    process.env.END_POINT_SECRT
  );

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: "visa payed" }
    );
    return res.json({ message: "Done" });
  }
  await orderModel.findOneAndUpdate(
    { _id: orderId },
    { status: "failed to pay" }
  );
  return res.json({ message: "Failed" });
};

