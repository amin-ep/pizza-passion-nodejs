import { z } from "zod";

const validateCreateRating = z.object({
  user: z.string({
    required_error: "Please add the user id",
  }),
  pizza: z.string(),
  rate: z.number().min(1).max(5),
});

export { validateCreateRating };
