import { NextFunction, Request, Response } from "express";
import { IRating } from "../interfaces/rating.js";
import Rating from "../models/Rating.js";
import catchAsync from "../utils/catchAsync.js";
import Factory from "./factory.controller.js";
import { Forbidden } from "../utils/appError.js";

export default class RatingController extends Factory<IRating> {
  constructor() {
    super(Rating);
  }

  checkUserHasRated = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const rating = await Rating.findOne({
        user: req.user._id,
        pizza: req.body.pizza,
      });

      if (rating) {
        return next(new Forbidden("You have rated this item before!"));
      }

      next();
    }
  );
}
