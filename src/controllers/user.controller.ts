import { NextFunction, Request, Response } from "express";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Unauthorized,
} from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/User.js";
import Factory from "./factory.controller.js";
import emailSender from "../utils/emailSender.js";

export default class UserController extends Factory<IUser> {
  constructor() {
    super(User);
  }

  updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.password) {
        return next(new Forbidden("cannot update password on this route"));
      }

      const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        returnOriginal: false,
      });

      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    }
  );

  getMe = (req: Request, res: Response, next: NextFunction) => {
    req.params.id = req.user._id as string;
    next();
  };

  updateMyPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.user._id);

      if (user?.password) {
        const verifyPassword = await user?.verifyPassword(
          req.body.currentPassword
        );
        if (!verifyPassword) {
          return next(new BadRequest("Your current password is invalid!"));
        }
      }

      user!.password = req.body.password;
      await user!.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    }
  );

  updateEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const checkEmailExists = await User.findOne({
        email: req.body.candidateEmail,
      });

      if (checkEmailExists) {
        return next(new Forbidden("There is a user with this email!"));
      }

      const user = await User.findById(req.user._id);

      user!.candidateEmail = req.body.candidateEmail;
      const verificationCode = await user!.generateVerificationCode(
        "updateEmail"
      );
      await user!.save({ validateBeforeSave: false });

      const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Change Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: Arial, sans-serif;
        }
        .email-wrapper {
          max-width: 600px;
          margin: auto;
          background-color: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .email-header {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        .email-body {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }
        .code-box {
          font-size: 20px;
          font-weight: bold;
          background-color: #f1f1f1;
          padding: 14px 24px;
          border-radius: 8px;
          letter-spacing: 1.5px;
          color: #333;
          text-align: center;
        }
        .footer {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">Verify Your New Email</div>
        <div class="email-body">
          You requested to change your email address. Use the code below to confirm the update:
        </div>
        <div class="code-box">${verificationCode}</div>
        <div class="footer">
          Didn’t request this change? Just ignore this message.
        </div>
      </div>
    </body>
  </html>
`;

      emailSender(
        res,
        {
          email: req.body.candidateEmail,
          html: html,
          subject: "Update Email Subject",
          text: "Update Email text",
        },
        200
      );
    }
  );
  public updateEmailResendCode = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({
        email: req.body.email,
        candidateEmail: req.body.candidateEmail,
      });

      if (!user) {
        return next(new NotFound("Invalid email address"));
      } else {
        const verificationCode = await user.generateVerificationCode(
          "updateEmail"
        );
        await user.save({ validateBeforeSave: false });

        emailSender(
          res,
          {
            email: req.body.candidateEmail,
            html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Change Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: Arial, sans-serif;
        }
        .email-wrapper {
          max-width: 600px;
          margin: auto;
          background-color: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .email-header {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        .email-body {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }
        .code-box {
          font-size: 20px;
          font-weight: bold;
          background-color: #f1f1f1;
          padding: 14px 24px;
          border-radius: 8px;
          letter-spacing: 1.5px;
          color: #333;
          text-align: center;
        }
        .footer {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">Verify Your New Email</div>
        <div class="email-body">
          You requested to change your email address. Use the code below to confirm the update:
        </div>
        <div class="code-box">${verificationCode}</div>
        <div class="footer">
          Didn’t request this change? Just ignore this message.
        </div>
      </div>
    </body>
  </html>
`,
            subject: "Update Email Verification",
            text: "Verify New Email",
          },
          200
        );
      }
    }
  );

  updateEmailVerify = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new NotFound("There is no user with this id"));
      }

      if (
        !(await user.verifyInputVerificationCode(
          "updateEmail",
          req.body.verificationCode
        ))
      ) {
        return next(new Unauthorized("Invalid or expired code"));
      }

      user.email = user.candidateEmail as string;
      user.candidateEmail = undefined;
      user.updateEmailVerificationCode = undefined;
      user.updateEmailVerificationCodeExpiryDate = undefined;
      user.emailChangedAt = new Date();
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        message: "Your email updated successfully",
        data: {
          user,
        },
      });
    }
  );
}
