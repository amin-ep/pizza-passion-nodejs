import { z } from "zod";

export const stringSchema = (fieldName: string, min: number, max: number) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} should be a string value`,
    })
    .min(min, {
      message: `${fieldName} should be at least ${min} characters`,
    })
    .max(max, {
      message: `${fieldName} should be ${max} or less characters`,
    });

export const email = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email should be a string value",
  })
  .email({
    message: "Please provide a valid email address",
  });

export const firstName = stringSchema("Fullname", 2, 40);
export const lastName = stringSchema("Fullname", 2, 40);

export const phone = z
  .string()
  .length(11, { message: "Phone number must be exactly 11 characters long" })
  .regex(/^\d+$/, { message: "Phone number must contain only digits" });

export const verificationCode = stringSchema("Verification Code", 6, 6);
