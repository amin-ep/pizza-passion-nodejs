import { z } from "zod";
import { phone, stringSchema } from "./index.js";

const address = z.object({
  street: stringSchema("Street", 2, 50),
  postalCode: z.string().length(10, {
    message: "Postal code must be 10 digits",
  }),
  text: stringSchema("Text", 10, 200),
});

const cart = z.string();
const customer = z.string();
const deliveryTime = z.coerce.date();
const description = z.string().min(10).max(200).optional();

const adminNotes = z.object({
  text: stringSchema("Admin note", 2, 100),
});

const status = z.string(
  z.enum(["waiting", "accepted", "posted", "received", "canceled"])
);

const validateCreateOrder = z.object({
  address,
  cart,
  customer,
  phone,
  description,
});

const validateEditOrder = z.object({
  address: address.optional(),
  deliveryTime: deliveryTime.optional(),
  phone: phone.optional(),
  status: status.optional(),
  adminNotes: adminNotes.optional(),
});

export { validateCreateOrder, validateEditOrder };
