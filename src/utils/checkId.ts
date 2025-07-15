import { NextFunction, Response, Request } from "express";

import { isValidObjectId } from "mongoose";
import { NotFound } from "../utils/appError.js";

export default function checkID(
  _req: Request,
  _res: Response,
  next: NextFunction,
  val: string
) {
  if (!isValidObjectId(val)) {
    return next(new NotFound(`Invalid Id: ${val}`));
  }
  next();
}
