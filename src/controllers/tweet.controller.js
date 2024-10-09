import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { _id } = req.user;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({owner: _id, content});

    if (!tweet) {
        throw new ApiError(500, "Tweet not created");
    }

    return res
        .status(201)
        .send(new ApiResponse(201, "Tweet created successfully", tweet));
});

// Get all tweets by userId
const getAllTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    const tweets = await Tweet.find({ owner: userId }).select("-__v -updatedAt");

    return res
        .status(200)
        .send(new ApiResponse(200, "Tweets found", tweets));
});

// Get tweet by id
const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is required");
    }

    const tweet = await Tweet.findById(tweetId).select("-__v");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .send(new ApiResponse(200, "Tweet found", tweet));
});

// Update tweet by id
const updateTweetById = asyncHandler(async (req, res) => {
    const { tweetId, content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is required");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true }).select("-__v -updatedAt");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .send(new ApiResponse(200, "Tweet updated successfully", tweet));
});

// Delete tweet by id
const deleteTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is required");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .send(new ApiResponse(200, "Tweet deleted successfully", tweet));
});

export { createTweet, getAllTweets, getTweetById, updateTweetById, deleteTweetById };