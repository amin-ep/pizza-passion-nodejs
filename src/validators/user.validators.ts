import { z } from "zod";
import { email, stringSchema, verificationCode } from "./index.js";

const firstName = stringSchema("First name", 2, 30);
const lastName = stringSchema("Last name", 2, 30);
const username = stringSchema("Username", 4, 30);

const role = z.enum(["admin", "customer"], {
  message: "Invalid input role. role must be admin or user value",
  required_error: "role is required",
});
const active = z.boolean({
  required_error: "active is required",
});
const imageUrl = z.string();

const validateUpdateMe = z.object({
  firstName: firstName.optional(),
  lastName: lastName.optional(),
  username: username.optional(),
  imageUrl: imageUrl.optional(),
});

const validateUpdatePassword = z.object({
  password: stringSchema("Password", 8, 12),
  currentPassword: stringSchema("Current Password", 8, 12),
});

const validateUpdateUser = z
  .object({
    firstName: firstName.optional(),
    lastName: lastName.optional(),
    username: username.optional(),
    role: role.optional(),
    active: active.optional(),
  })
  .optional();

const validateUpdateEmail = z.object({
  candidateEmail: email,
});

const validateUpdateEmailVerify = z.object({
  verificationCode: verificationCode,
});

export {
  validateUpdateMe,
  validateUpdatePassword,
  validateUpdateUser,
  validateUpdateEmail,
  validateUpdateEmailVerify,
};
