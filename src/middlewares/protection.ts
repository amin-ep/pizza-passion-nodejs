/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Response, NextFunction, Request } from "express";
import { Forbidden, NotFound, Unauthorized } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/User.js";

class ProtectMiddlewares {
  public protect = catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      let token: string = "";

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(
          new Unauthorized("You are not logged in. Please login first")
        );
      }

      // @ts-ignore
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new NotFound("The user does not exists"));
      }

      const userHasChangedPasswordRecently = user.checkPasswordChangedTime(
        decoded.iat as number
      );

      if (userHasChangedPasswordRecently) {
        return next(
          new Unauthorized(
            "The user has changed password recently. Please login again"
          )
        );
      }

      req.user = user;

      next();
    }
  );

  public restrictTo(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (req.user && !roles.includes(req.user.role)) {
        return next(
          new Forbidden("Yo do not have permission to perform this action")
        );
      }
      next();
    };
  }
}

export default ProtectMiddlewares;
