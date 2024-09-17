import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/fileUpload.js";
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
    avatar: { url: avatar.url, publicId: avatar.public_id },
    coverImage: { url: coverImage?.url || "", publicId: coverImage?.public_id },
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

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    throw new ApiError(400, "Current password and new password are required");

  const { _id } = req.user;
  const user = await User.findById(_id);
  const isPassCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPassCorrect) throw new ApiError(400, "Current password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .send(new ApiResponse(200, "Password changed successfully", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).send(new ApiResponse(200, "User found", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .send(new ApiResponse(200, "Account details updated successfully", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const { _id, avatar: prevAvatar } = req.user;
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) throw new ApiError(400, "Error while uploading avatar");
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        avatar: { url: avatar?.url, publicId: avatar?.public_id },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (user) {
    await deleteFromCloudinary(prevAvatar.publicId); // delete the old cover image from cloudinary
  }

  return res
    .status(200)
    .send(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const { _id, coverImage: prevCoverImage } = req.user;
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath)
    throw new ApiError(400, "Cover image file is missing");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url)
    throw new ApiError(400, "Error while uploading cover image");
  const user = await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        coverImage: { url: coverImage?.url, publicId: coverImage?.public_id },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (user) {
    await deleteFromCloudinary(prevCoverImage.publicId); // delete the old cover image from cloudinary
  }

  return res
    .status(200)
    .send(new ApiResponse(200, "Cover image updated successfully", user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
