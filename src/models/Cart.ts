import mongoose, { Query, Schema } from "mongoose";
import { ICart } from "../interfaces/cart.js";

const cartSchema = new Schema<ICart>(
  {
    cartItems: [
      {
        pizza: {
          ref: "Pizza",
          type: Schema.Types.ObjectId,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    customer: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
    totalPrice: Number,
    totalQuantity: Number,
    ordered: {
      default: false,
      type: Boolean,
    },
  },
  { timestamps: true }
);

cartSchema.pre("save", async function (next) {
  const quantities: number[] = this.cartItems.map((item) => item.quantity);
  let sumQuantities: number = 0;

  quantities.forEach((el) => {
    sumQuantities += el;
  });
  this.totalQuantity = sumQuantities;

  const pricesArr: { price: number; quantity: number }[] = [];
  let sumPrices: number = 0;
  await this.populate({
    path: "cartItems.pizza",
  })
    .then(() => {
      this.cartItems.map((el) => {
        pricesArr.push({
          price: (el.pizza as IPizza).finalPrice,
          quantity: el.quantity,
        });
      });
    })
    .then(() => {
      pricesArr.forEach((el) => {
        sumPrices += el.price * el.quantity;
      });
    })
    .then(() => {
      this.totalPrice = +sumPrices.toFixed(2);
    });

  next();
});

cartSchema.pre(/^find/, function (this: Query<ICart, ICart[]>, next) {
  this.populate({
    path: "cartItems.pizza",
  });
  next();
});

export default mongoose.model("Cart", cartSchema);
