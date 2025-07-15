import { Types } from "mongoose";
import { CartItem } from "./cart";

export enum OrderStatus {
  WAITING = "waiting",
  ACCEPTED = "accepted",
  POSTED = "posted",
  RECEIVED = "received",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

interface IOrder extends Document {
  address: Address;
  cart: Types.ObjectId;
  customer: Types.ObjectId;
  deliveryTime: Date;
  phone: string;
  status: OrderStatus | string;
  statusHistory: {
    status: OrderStatus | string;
    changedAt: Date;
  };
  description: string;
  adminNotes?: {
    text: string;
    lastUpdate: Date;
  };
}
