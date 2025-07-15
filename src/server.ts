import { config } from "dotenv";
import app from "./app.js";
import mongoose from "mongoose";

config({ path: ".env" });

const MONGODB_URI = process.env.DB_URI as string;

const PORT: number = (process.env.PORT as number | undefined) || 8000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("CONNECTED"))
  .catch((err) => console.log("error is:", err));

app.listen(PORT, () => {
  console.log(`App is running on port: ${PORT}`);
});
