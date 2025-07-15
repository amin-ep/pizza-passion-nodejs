import { Types } from "mongoose";

interface IRating extends Document {
  user: Types.ObjectId;
  rate: number;
  pizza: Types.ObjectId;
}
