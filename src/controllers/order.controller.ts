import { NextFunction, Request, Response } from "express";
import { IOrder } from "../interfaces/order.js";
import Order from "../models/Order.js";
import Factory from "./factory.controller.js";
import catchAsync from "../utils/catchAsync.js";
import { NotFound } from "../utils/appError.js";

export default class OrderController extends Factory<IOrder> {
  constructor() {
    super(Order);
  }

  getMyOrders = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const orders = await Order.find({ customer: req.user._id });

      res.status(200).json({
        status: "success",
        data: {
          orders,
        },
      });
    }
  );
}
