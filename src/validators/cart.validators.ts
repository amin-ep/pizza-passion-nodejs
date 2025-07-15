import mongoose from "mongoose";
import { z } from "zod";

const pizza = z.string();

const customer = z.string();

const validateAddToCart = z.object({
  customer: customer,
  pizza: pizza,
});

export { validateAddToCart };
