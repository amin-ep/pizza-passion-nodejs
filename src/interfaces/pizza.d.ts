interface IPizza extends Document {
  name: string;
  discount?: number;
  imageUrl: string;
  ingredients: string[];
  unitPrice: number;
  finalPrice: number;

  ratings: Types.ObjectId[];
  ratingsAverage: number;
  ratingsQuantity: number;
}
