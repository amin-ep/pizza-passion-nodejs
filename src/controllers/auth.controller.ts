import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Unauthorized,
} from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import emailSender from "../utils/emailSender.js";

export default class AuthController {
  private generateToken(id: string) {
    // @ts-ignore
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: process.env.JWT_EXPIRES_IN as string,
    });
    return token;
  }

  private validateEmptyBody() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.body ||
        Object.entries(req.body).length == 0 ||
        (!req.body.email && !req.body.username)
      ) {
        return next(new BadRequest("Please fill required fields"));
      }
      next();
    };
  }

  public register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const existingUser = await User.findOne({
        email: req.body.email,
      });

      // user exists with this email
      if (existingUser) {
        if (existingUser.active === true && existingUser.verified === true) {
          return next(new Forbidden("There is a user with this email"));
        }

        if (existingUser.active === false || existingUser.verified === false) {
          // user exists but not active
          existingUser.active = true;
          existingUser.verified = false;
          const verificationCode = await existingUser.generateVerificationCode(
            "auth"
          );
          await existingUser.save({ validateBeforeSave: false });

          emailSender(
            res,
            {
              email: req.body.email,
              html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }
        .email-wrapper {
          width: 100%;
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
          margin-bottom: 20px;
          color: #333;
        }
        .email-body {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }
        .code {
          font-size: 20px;
          font-weight: bold;
          background-color: #f1f1f1;
          padding: 12px 20px;
          border-radius: 8px;
          letter-spacing: 2px;
          margin-bottom: 25px;
          color: #333;
        }
        .footer {
          margin-top: 40px;
          font-size: 13px;
          color: #888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">Verify Your Email</div>
        <div class="email-body">
          Welcome! To complete your registration, please use the code below:
        </div>
        <div class="code">${verificationCode}</div>
        <div class="footer">
          If you didn't request this email, feel free to ignore it.
        </div>
      </div>
    </body>
  </html>
`,
              subject: "Email Verification",
              text: "Verify Email",
            },
            201
          );
        }
      } else {
        // user does not exists
        const newUser = await User.create(req.body);
        const verificationCode = await newUser.generateVerificationCode("auth");
        await newUser.save({ validateBeforeSave: false });

        emailSender(
          res,
          {
            email: req.body.email,
            html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }
        .email-wrapper {
          width: 100%;
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
          margin-bottom: 20px;
          color: #333;
        }
        .email-body {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }
        .code {
          font-size: 20px;
          font-weight: bold;
          background-color: #f1f1f1;
          padding: 12px 20px;
          border-radius: 8px;
          letter-spacing: 2px;
          margin-bottom: 25px;
          color: #333;
        }
        .footer {
          margin-top: 40px;
          font-size: 13px;
          color: #888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">Verify Your Email</div>
        <div class="email-body">
          Welcome! To complete your registration, please use the code below:
        </div>
        <div class="code">${verificationCode}</div>
        <div class="footer">
          If you didn't request this email, feel free to ignore it.
        </div>
      </div>
    </body>
  </html>
`,
            subject: "Email Verification",
            text: "Verify Email",
          },
          201
        );
      }
    }
  );

  public verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new NotFound("There is no user with this email!"));
      }

      if (
        !(await user.verifyInputVerificationCode(
          "auth",
          req.body.verificationCode
        ))
      ) {
        return next(new Unauthorized("Invalid or expired code"));
      }

      user.verified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpiryDate = undefined;
      await user.save({ validateBeforeSave: false });
      const token = this.generateToken(user._id);

      res.status(200).json({
        status: "success",
        token: token,
        data: {
          user,
        },
      });
    }
  );

  public login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email });

      if (
        !user ||
        !(await user.verifyPassword(req.body.password)) ||
        user.active === false
      ) {
        return next(new BadRequest(`Invalid input email or password`));
      }

      if (user.verified === false) {
        return next(new Unauthorized("This email is not verified yet!"));
      }

      const token = this.generateToken(user._id);

      res.status(200).json({
        status: "success",
        token: token,
        data: {
          user,
        },
      });
    }
  );

  public forgetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new NotFound("Invalid email!"));
      }

      const recoverId = await user.generateRecoverId();
      await user.save({ validateBeforeSave: false });

      const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Recovery</title>
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
        .recovery-link {
          font-size: 16px;
          display: block;
          word-break: break-all;
          margin-bottom: 25px;
          color: #C69963;
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
        <div class="email-header">Reset Your Password</div>
        <div class="email-body">
          You requested a password reset. Click the link below to continue:
        </div>
        <a href="http://localhost:3000/recover/${recoverId}" class="recovery-link">
          http://localhost:3000/recover/${recoverId}
        </a>
        <div class="footer">
          If you didn’t request this, just ignore this email.
        </div>
      </div>
    </body>
  </html>
          `;

      emailSender(
        res,
        {
          email: req.body.email,
          html: html,
          subject: "forget password",
          text: "forget password",
        },
        200
      );
    }
  );

  public resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({
        passwordRecoverId: req.params.recoverId,
      });

      if (!user) {
        return next(new NotFound("Invalid recover id"));
      }

      user.password = req.body.password;
      user.passwordRecoverId = undefined;
      user.passwordChangedAt = new Date();

      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        message: "Your password changed successfully",
      });
    }
  );

  public requestEmailVerificationCode = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new NotFound("Invalid email address"));
      } else {
        if (user.verified) {
          return next(new Forbidden("These email has been verified"));
        } else {
          const verificationCode = await user.generateVerificationCode("auth");
          await user.save({ validateBeforeSave: false });

          emailSender(
            res,
            {
              email: req.body.email,
              html: `<div>
              ${verificationCode}
                     </div>`,
              subject: "Email Verification",
              text: "Verify Email",
            },
            200
          );
        }
      }
    }
  );
}
