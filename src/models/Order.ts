import mongoose, { Query, Schema } from "mongoose";
import { IOrder } from "../interfaces/order.js";
import Cart from "./Cart.js";

const orderSchema = new Schema<IOrder>(
  {
    address: {
      street: String,
      postalCode: String,
      text: String,
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    customer: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
    deliveryTime: Date,
    phone: String,
    status: {
      default: "waiting",
      type: String,
      enum: ["waiting", "accepted", "posted", "received", "canceled"],
    },
    statusHistory: {
      status: {
        type: String,
        enum: ["waiting", "accepted", "posted", "received", "canceled"],
        default: "waiting",
      },
      changedAt: {
        type: Date,
        default: new Date(),
      },
    },
    adminNotes: {
      text: String,
      lastUpdate: Date,
    },
    description: String,
  },
  { timestamps: true }
);

orderSchema.post("save", async function () {
  if (this.status === "waiting") {
    const cartId = this.cart;
    await Cart.findByIdAndUpdate(cartId, {
      ordered: true,
    });
  }
});

orderSchema.pre(/^find/, function (this: Query<IOrder, IOrder[]>, next) {
  this.populate({
    path: "customer",
    select: "firstName lastName email phone",
  }).populate({
    path: "cart",
  });
  next();
});

orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory = {
      status: "waiting",
      changedAt: new Date(),
    };
  }
  next();
});

orderSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<IOrder> & {
    status?: string;
    adminNotes?: IOrder["adminNotes"];
  };

  if (update.status) {
    this.setUpdate({
      ...update,
      statusHistory: {
        status: update.status,
        changedAt: new Date(),
      },
    });
  }

  if (update.adminNotes) {
    this.setUpdate({
      ...update,
      adminNotes: {
        ...update.adminNotes,
        lastUpdate: new Date(),
      },
    });
  }

  next();
});

export default mongoose.model("Order", orderSchema);
