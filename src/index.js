// require("dotenv").config();
import dotenv from "dotenv";
import connetDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connetDB();
