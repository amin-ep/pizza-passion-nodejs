import { Types } from "mongoose";

type CartItem = {
  pizza: Types.ObjectId[] | IPizza;
  quantity: number;
};

interface ICart extends Document {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  ordered: boolean;
  customer: Types.ObjectId;
}
