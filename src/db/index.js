import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connetDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      "\n Connected to database: ",
      connectionInstance.connection.name
    );
  } catch (error) {
    console.log("Error connecting to database: ", error.message);
    process.exit(1); // read about process
  }
};

export default connetDB;
