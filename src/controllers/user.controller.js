import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // if (!user) throw new ApiError(404, "User not found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // take the user data from the request body
  const { username, password, email, fullName } = req.body;

  // check if all fields are provided
  if (
    [username, password, email, fullName].some((item) => item?.trim() === "")
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if user with email or username already exists
  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath =
    req.files?.coverImage?.length > 0 && req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // create user with given data
  const user = await User.create({
    fullName,
    password,
    email,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check if user created successfully and filter out password and refreshtoken to send the data
  const createdUser = await User.findOne({ _id: user._id }).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user");

  res
    .status(201)
    .send(new ApiResponse(200, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  // take the user data from the request body
  const { username, email, password } = req.body;

  if (!username && !email)
    throw new ApiError(400, "Username or email is required");

  // check if usre with email exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  }); // include password in the query
  if (!existingUser) {
    throw new ApiError(400, "User with email does not exist");
  }

  // check if password is correct
  const isPassCorrect = await existingUser.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Password is incorrect");
  }

  // generate access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  const options = {
    httpOnly: true,
    // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: true,
  };

  const {
    refreshToken: token,
    password: pass,
    ...dataToSend
  } = existingUser._doc; // Exclude password and refreshToken from the response

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options) // Set the cookie with the refresh token
    .cookie("accessToken", accessToken, options) // Set the cookie with the access token
    .send(
      new ApiResponse(200, "User logged in successfully", {
        userDetails: dataToSend,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true, // return the updated document
    }
  );

  const options = {
    httpOnly: true,
    // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .send(new ApiResponse(200, "User logged out successfully", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const { _id } = await jwt.verify(
      incommingRefreshToken,
      config.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(_id);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (user.refreshToken !== incommingRefreshToken)
      throw new ApiError(401, "Invalid refresh token");

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(_id);

    const options = {
      httpOnly: true,
      // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .send(
        new ApiResponse(200, "Access token refreshed", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
