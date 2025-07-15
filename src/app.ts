import express, { NextFunction, Request, Response } from "express";

import { NotFound } from "./utils/appError.js";
import globalErrorHandler from "./handlers/error.handler.js";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import pizzaRouter from "./routes/pizza.routes.js";
import cartRouter from "./routes/cart.routes.js";
import userRouter from "./routes/user.routes.js";
import orderRouter from "./routes/order.routes.js";
import ratingRouter from "./routes/rating.routes.js";

const app = express();

declare module "express-serve-static-core" {
  interface Request {
    user: IUser;
  }
}

app.use(express.json());

app.use(cors());

app.use("/static", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/pizza", pizzaRouter);
app.use("/api/cart", cartRouter);
app.use("/api/user/", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/rating", ratingRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(
    new NotFound(`This route is not yet defined: ${req.originalUrl}`)
  );
});

app.use(globalErrorHandler);

export default app;
