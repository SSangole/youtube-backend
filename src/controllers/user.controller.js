import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
