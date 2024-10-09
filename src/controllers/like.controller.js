import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Toggle like status of video
const toggleLikeStatusOfVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
        let prevLike = await Like.find({ video: videoId, likedBy: req.user._id });
        prevLike = prevLike[0]; // Get the first like object as find returns an array
        if (!prevLike) {
            const newLike = await Like.create({
                video: videoId,
                likedBy: req.user._id,
            });
            if (!newLike) {
                throw new ApiError(500, "Failed to like video");
            }
            return res.
            status(201)
            .send(new ApiResponse(201, "Video liked successfully", newLike));
        } else {
            const updatedLike = await Like.findByIdAndUpdate(prevLike._id, { isLiked: !prevLike.isLiked }, { new: true });
            if (!updatedLike) {
                throw new ApiError(500, "Failed to update like status");
            }
            return res.
            status(200)
            .send(new ApiResponse(200, "Video like status updated successfully", updatedLike));
        }
});

// Toggle like status of comment
const toggleLikeStatusOfComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment id is required");
    }

    const prevLike = await Like.find({ comment: commentId, likedBy: req.user._id });
    prevLike = prevLike[0]; // Get the first like object as find returns an array
    if (!prevLike) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        });
        if (!newLike) {
            throw new ApiError(500, "Failed to like comment");
        }
        return res.
            status(201)
            .send(new ApiResponse(201, "Comment liked successfully", newLike));
    } else {
        const updatedLike = await Like.findByIdAndUpdate(prevLike._id, { isLiked: !prevLike.isLiked }, { new: true });
        if (!updatedLike) {
            throw new ApiError(500, "Failed to update like status");
        }
        return res.
            status(200)
            .send(new ApiResponse(200, "Comment like status updated successfully", updatedLike));
    }
});

// Toggle like status of tweet
const toggleLikeStatusOfTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    const prevLike = await Like.find({ tweet: tweetId, likedBy: req.user._id });
    prevLike = prevLike[0]; // Get the first like object as find returns an array
        if (!prevLike) {
            const newLike = await Like.create({
                tweet: tweetId,
                likedBy: req.user._id,
            });
            if (!newLike) {
                throw new ApiError(500, "Failed to like tweet");
            }
            return res.
            status(201).
            send(new ApiResponse(201, "Tweet liked successfully", newLike));
        } else {
            const updatedLike = await Like.findByIdAndUpdate(prevLike._id, { isLiked: !prevLike.isLiked }, { new: true });
            if (!updatedLike) {
                throw new ApiError(500, "Failed to update like status");
            }
            return res.
            status(200)
            .send(new ApiResponse(200, "Tweet like status updated successfully", updatedLike));
        }
});

// Get all liked videos by user
const getAllLikedVideosByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    // const likedVideos = await Like.find({ likedBy: userId, video: {$ne: null}}).select("-__v -createdAt -updatedAt -likedBy -isLiked").populate("video", "-__v -updatedAt");

    const likedVideos = await Like.aggregate([
        {
            $match: { // Filter only liked videos if video is not null
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $ne: null}
            },
        },
        {
            $project: { // Select only required fields from liked videos
                _id: 1,
                video: 1
            }
        },
        {
            $lookup: { // Join videos collection to get video details
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            __v: 0,
                            updatedAt: 0,
                        }
                    }
                ]
            }
        }
    ]);

    return res.
    status(200)
    .send(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
});

// Get all liked videos by user
const getAllLikedTweetsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const likedTweets = await Like.find({ likedBy: userId, tweet: {$ne: null}}).select("-__v -createdAt -updatedAt -likedBy -isLiked").populate("tweet", "-__v -updatedAt");

    return res.
    status(200)
    .send(new ApiResponse(200, "Liked tweets fetched successfully", likedTweets));
});

export { toggleLikeStatusOfVideo, toggleLikeStatusOfComment, toggleLikeStatusOfTweet, getAllLikedVideosByUser, getAllLikedTweetsByUser };