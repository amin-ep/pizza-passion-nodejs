import { NextFunction, Request, Response } from "express";
import { ICart } from "../interfaces/cart.js";
import Cart from "../models/Cart.js";
import catchAsync from "../utils/catchAsync.js";
import Factory from "./factory.controller.js";
import { NotFound } from "../utils/appError.js";

export default class CartController extends Factory<ICart> {
  constructor() {
    super(Cart);
  }

  addToCart = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userUnorderedCart = await Cart.findOne({
        customer: req.body.customer,
        ordered: false,
      });

      const inputItem = req.body.pizza;
      if (userUnorderedCart) {
        const itemHasAddedIndex = userUnorderedCart.cartItems.findIndex(
          // @ts-ignore
          (item) => item.pizza._id == inputItem
        );

        if (itemHasAddedIndex > -1) {
          userUnorderedCart.cartItems[itemHasAddedIndex].quantity += 1;
        } else {
          userUnorderedCart.cartItems.push({ pizza: inputItem, quantity: 1 });
        }

        await userUnorderedCart.save({ validateBeforeSave: false });
        res.status(201).json({
          status: "success",
          data: {
            cart: userUnorderedCart,
          },
        });
      } else {
        const newCart = await Cart.create({
          cartItems: { pizza: inputItem },
          customer: req.body.customer,
        });

        res.status(201).json({
          status: "success",
          data: {
            cart: newCart,
          },
        });
      }
    }
  );

  removeFromCart = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const cart = await Cart.findOne({
        ordered: false,
        customer: req.body.customer,
      });

      if (!cart) {
        return next(new NotFound("You do not have any unordered cart"));
      } else {
        const targetItem = cart.cartItems.find(
          // @ts-ignore
          (item) => item.pizza._id.toString() == req.params.itemId
        );

        const targetItemIndex = cart.cartItems.findIndex(
          // @ts-ignore
          (item) => item.pizza._id.toString() == req.params.itemId
        );

        if (!targetItem) {
          return next(new NotFound("There is no item with this id"));
        }

        if (cart.cartItems.length === 1 && targetItem?.quantity == 1) {
          await Cart.findByIdAndDelete(cart._id);
        } else if (targetItem?.quantity > 1) {
          cart.cartItems[targetItemIndex].quantity -= 1;
          await cart.save({ validateBeforeSave: false });
        } else if (cart.cartItems.length > 1 && targetItem?.quantity === 1) {
          cart.cartItems = cart.cartItems.filter(
            (item) => item.pizza !== targetItem.pizza
          );
          await cart.save({ validateBeforeSave: false });
        }
        res.status(204).json({
          status: "success",
          data: null,
        });
      }
    }
  );

  getMyCart = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const cart = await Cart.findOne({
        customer: req.user._id,
        ordered: false,
      });

      if (!cart) {
        return next(new NotFound("There is no cart with this user id"));
      } else {
        res.status(200).json({
          status: "success",
          data: {
            cart,
          },
        });
      }
    }
  );
}
