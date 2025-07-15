import mongoose, { Query, Schema } from "mongoose";

const pizzaSchema = new Schema<IPizza>(
  {
    name: {
      type: String,
    },
    discount: {
      type: Number,
      index: true,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
    ingredients: {
      type: [String],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Price cannot be negative"],
    },
    ratingsAverage: Number,
    ratingsQuantity: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pizzaSchema.virtual("finalPrice").get(function (this: IPizza) {
  if (this.discount) {
    return Number(this.unitPrice - this.discount).toFixed();
  } else {
    return +this.unitPrice;
  }
});

pizzaSchema.virtual("ratings", {
  ref: "Rating",
  foreignField: "pizza",
  localField: "_id",
});

pizzaSchema.pre(/^find/, function (this: Query<IPizza, IPizza[]>, next) {
  this.populate({
    path: "ratings",
    select: "rate user",
  });
  next();
});

export default mongoose.model("Pizza", pizzaSchema);
