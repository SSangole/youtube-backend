import config from "../config/config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers["Authorization"]?.split(" ")[1];
    // const refreshToken = req.cookies.refreshToken;
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // verify the access token
    const { _id } = await jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);

    const user = await User.findById(_id).select("-refreshToken -password");
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }
});
