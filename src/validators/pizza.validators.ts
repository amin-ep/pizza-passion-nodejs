import { z } from "zod";
import { stringSchema } from "./index.js";

const name = stringSchema("Name", 4, 50);

const imageUrl = z.string({
  required_error: "Image URL is required",
  invalid_type_error: "Image URL must be a string",
});

const unitPrice = z.coerce
  .number({
    required_error: "Unit price is required",
    invalid_type_error: "Unit price must be a number",
  })
  .min(10, "Price cannot be less than $10")
  .max(200, "Price cannot exceed $200");

const discount = z.coerce
  .number({
    required_error: "Discount is required",
    invalid_type_error: "Discount must be a number",
  })
  .min(1, "Discount cannot be less than 1")
  .max(199, "Discount cannot exceed 199");

const ingredients = z
  .array(
    z.string({
      required_error: "Each pizza needs some ingredients",
    }),
    {
      required_error: "Ingredients are required",
      invalid_type_error: "Ingredients must be an array of strings",
    }
  )
  .min(1, "At least one ingredient is required");

export const validateCreatePizza = z.object({
  imageUrl,
  name,
  unitPrice,
  discount: discount.optional(),
  ingredients,
});
