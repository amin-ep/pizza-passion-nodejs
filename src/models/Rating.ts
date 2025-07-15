import mongoose, { Schema } from "mongoose";
import { IRating } from "../interfaces/rating.js";
import Pizza from "./Pizza.js";

const ratingSchema = new Schema<IRating>(
  {
    user: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
    rate: {
      type: Number,
    },
    pizza: {
      type: Schema.Types.ObjectId,
      ref: "Pizza",
    },
  },
  {
    timestamps: true,
  }
);

async function updatePizzaRating(pizzaId: mongoose.Types.ObjectId) {
  const stats = await mongoose.model("Rating").aggregate([
    {
      $match: { pizza: pizzaId as mongoose.Types.ObjectId },
    },
    {
      $group: {
        _id: "$pizza",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rate" },
      },
    },
  ]);

  await Pizza.findByIdAndUpdate(pizzaId, {
    ratingsQuantity: stats[0].ratingsQuantity,
    ratingsAverage: stats[0].ratingsAverage,
  });
}

ratingSchema.post("save", async function () {
  await updatePizzaRating(this.pizza);
});

ratingSchema.post("findOneAndDelete", async function (doc: IRating | null) {
  if (doc) {
    await updatePizzaRating(doc.pizza);
  }
});

export default mongoose.model("Rating", ratingSchema);
