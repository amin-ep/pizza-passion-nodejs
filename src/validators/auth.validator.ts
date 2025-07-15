import { z } from "zod";
import {
  email,
  firstName,
  lastName,
  phone,
  stringSchema,
  verificationCode,
} from "./index.js";

const password = stringSchema("Password", 8, 12);

const validateLogin = z.object({
  email: email,
  password: password,
});

const validateSignup = z.object({
  firstName,
  lastName,
  password,
  email: email,
  phone: phone.optional(),
});

const validateVerifyEmail = z.object({
  email: email,
  verificationCode,
});

const validateForgetPassword = z.object({
  email: email,
});

const validateResetPassword = z.object({
  password,
});

export {
  validateLogin,
  validateSignup,
  validateVerifyEmail,
  validateForgetPassword,
  validateResetPassword,
};
