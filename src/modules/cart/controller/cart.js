import cartModel from "../../../../DB/models/cart.model.js";
import productModel from "../../../../DB/models/product.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const addProductInCart = asyncHandler(async (req, res, next) => {
  if (req.user.wishlist.length > 0) {
    req.user.wishlist.map(async (id) => {
      let isProductInCart = await cartModel.findOne({
        user: req.user._id,
        "products.productId": id,
      });
      if (isProductInCart) {
        isProductInCart.products.forEach((productObj) => {
          let f = false;

          if (
            productObj.productId.toString() === productId.toString() &&
            productObj.quantity + quantity <= product.availableItems
          ) {
            productObj.quantity = productObj.quantity + quantity;
            f = true;
          }
          if (!f)
            return res.json({
              success: false,
              message: "this quantity of product left on the stock !",
            });
        });

        await isProductInCart.save();
        return res.json({
          success: true,
          results: isProductInCart,
          message: "product added successfully!",
        });
      } else {
        const cart = await cartModel.findOneAndUpdate(
          { user: req.user._id },
          { $push: { products: { id, quantity } } },
          { new: true }
        );
        return res.json({
          success: true,
          results: cart,
          message: "product added successfully!",
        });
      }
    });
  }

  const { productId, quantity } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("product not found ", { cause: 404 }));
  }
  if (!product.inStock(quantity)) {
    return next(
      new Error(
        `Sorry, only ${product.availableItems} Items left on the stock!`
      )
    );
  }

  let isProductInCart = await cartModel.findOne({
    user: req.user._id,
    "products.productId": productId,
  });

  let f = false;
  if (isProductInCart) {
    isProductInCart.products.forEach((productObj) => {
      if (
        productObj.productId.toString() === productId.toString() &&
        productObj.quantity + quantity <= product.availableItems
      ) {
        productObj.quantity = productObj.quantity + quantity;
        f = true;
      }
      if (!f)
        return res.json({
          success: false,
          message: "this quantity of product left on the stock !",
        });
    });

    await isProductInCart.save();
    return res.json({
      success: true,
      results: isProductInCart,
      message: "product added successfully!",
    });
  } else {
    const cart = await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { $push: { products: { productId, quantity } } },
      { new: true }
    );
    return res.json({
      success: true,
      results: cart,
      message: "product added successfully!",
    });
  }
});

export const getProductInCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ user: req.user._id })
    .populate(
      "products.productId",
      " name defaultImage.url price discount finalPrice"
    );
  return res.json({
    success: true,
    results: cart,
  });
});

export const updateCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("product not found ", { cause: 404 }));
  }

  if (!product.inStock(quantity)) {
    return next(
      new Error(
        `Sorry, only ${product.availableItems} Items left on the stock!`
      )
    );
  }

  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    {
      $set: { "products.$.quantity": quantity },
    },
    {
      new: true,
    }
  );
  return res.json({
    success: true,
    results: cart,
  });
});

export const removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
    },
    {
      $pull: { products: { productId: req.params.productId } },
    },
    {
      new: true,
    }
  );
  return res.json({
    success: true,
    results: cart,
    message: "product deleted successfully!",
  });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel.findOneAndUpdate({
    user: req.user._id,
    products: [],
  });
  return res.json({
    success: true,
    results: cart,
    message: "Cart cleared successfully!",
  });
});
