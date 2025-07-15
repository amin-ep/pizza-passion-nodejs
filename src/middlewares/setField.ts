import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";

export default class SetField {
  setUserOnBody = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body.user) req.body.user = req.user._id.toString();
      next();
    }
  );

  setCustomerOnBody = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body.customer) req.body.customer = req.user._id.toString();
      next();
    }
  );
}
