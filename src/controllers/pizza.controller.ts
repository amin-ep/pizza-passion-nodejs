import Pizza from "../models/Pizza.js";
import Factory from "./factory.controller.js";

export default class PizzaController extends Factory<IPizza> {
  constructor() {
    super(Pizza);
  }
}
