// require("dotenv").config();
import dotenv from "dotenv";
import connetDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

connetDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });
