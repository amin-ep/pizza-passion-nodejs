import { Request, Response, NextFunction } from "express";
import AppError, {
  BadRequest,
  NotFound,
  Unauthorized,
} from "../utils/appError.js";

const sendDevelopmentError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};

const sendProductionError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong from server!",
    });
  }
};

const handleCastError = (err: AppError) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const message = `Invalid Id: ${err.value}`;
  return new NotFound(message);
};

const handleTokenExpiredError = () => {
  return new Unauthorized("The token has been expired. Please login again!");
};

const handleJWTError = () => {
  return new Unauthorized("Invalid token. Please Login again!");
};

const handleLargePayloadError = (err: AppError) => {
  return new AppError(err.message, 413);
};

const handleDuplicateKeyError = (
  err: AppError & { keyValue?: Record<string, string>; message?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: Request
) => {
  const duplicateField = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
  const value = err.keyValue ? err.keyValue[duplicateField] : "";
  const message = `Duplicate field: ${duplicateField} (${value}). Please use another value!`;
  return new BadRequest(message);
};
export default function (
  err: AppError & { code?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if ((process.env.NODE_ENV as string) === "development") {
    sendDevelopmentError(err, res);
  } else {
    if (err.name === "CastError") err = handleCastError(err);
    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.statusCode === 413) err = handleLargePayloadError(err);
    if (err.code === 11000) err = handleDuplicateKeyError(err, req);
    sendProductionError(err, res);
  }
}
