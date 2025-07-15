import { config } from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Pizza from "../models/Pizza.js";

const pizzaPath = path.resolve("dist/data", "pizzas.json");

const pizza = JSON.parse(fs.readFileSync(pizzaPath, "utf-8"));

config({ path: ".env" });

mongoose
  .connect(process.env.DB_URI as string)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => console.log({ err }));

const deleteData = async () => {
  try {
    await Pizza.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const createData = async () => {
  try {
    // await Actor.create(actors);
    await Pizza.create(pizza);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--delete") {
  deleteData();
}

if (process.argv[2] === "--create") {
  createData();
}
