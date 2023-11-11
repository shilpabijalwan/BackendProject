import dotenv from "dotenv";

import express from "express";
import connectDB from "./db/index.js";

const app = express();

dotenv.config({
  path: "./env",
});
connectDB();

// async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (err) => {
//       console.log("Error connecting", err);
//     });
//     app.listen(process.env.PORT, () => {
//       console.log("app listening on port", process.env.PORT);
//     });
//   } catch (error) {
//     console.error("error", error);
//   }
// };
