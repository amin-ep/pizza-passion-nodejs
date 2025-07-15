import { Response } from "express";
import emailService, { IEmail } from "./email.js";
import AppError from "./appError.js";

export default async function emailSender(
  res: Response,
  options: IEmail,
  statusCode: number
) {
  try {
    await emailService(options);
    res.status(statusCode).json({
      status: "success",
      message: `An email sent to ${options.email}`,
      email: options.email,
    });
  } catch (err) {
    res.status(450).json({
      status: "error",
      message: "An error occurred while sending email",
      err: err as AppError,
    });
  }
}
