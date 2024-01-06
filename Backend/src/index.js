import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

connectDB()
  .then((res) => {
    app.on("error", (err) => {
      console.log("Error connecting", err);
    });
    app.listen(process.env.PORT || 4000);
    console.log("server running at", process.env.PORT);
  })
  .catch((err) => {
    console.log("mongo db connection not connected");
  });

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
