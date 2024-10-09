import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Subscribe to a channel
const subscribeToChannel = asyncHandler(async (req, res) => {
    const { subscriber, channel } = req.body;

    if (!subscriber || !channel) {
        throw new ApiError(400, "Subscriber and Channel are required");
    }

    const subscription = await Subscription.create({
        subscriber,
        channel,
    });

    if (!subscription) {
        throw new ApiError(500, "Subscription not created");
    }

    return res
        .status(201)
        .send(new ApiResponse(201, "Subscribed successfully", subscription));
});

// Unsubscribe from a channel
const unsubscribeFromChannel = asyncHandler(async (req, res) => {
    const { subscriber, channel } = req.body;

    if (!subscriber || !channel) {
        throw new ApiError(400, "Subscriber and Channel are required");
    }

    const subscription = await Subscription.findOneAndDelete({
        subscriber,
        channel,
    });

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    return res
        .status(200)
        .send(new ApiResponse(200, "Unsubscribed successfully", subscription));
});

// Get all subscribers of a channel
const getSubscribersOfChannel  = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel Id is required");
    }

    // const subscribers = await Subscription.find({ channel: channelId }).select("-__v -updatedAt").populate("subscriber", "_id username avatar fullName");
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                channel: 1,
                createdAt: 1,
            }
        },
        {
            $lookup: {
                from: "users",
                localField: 'subscriber',
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                        },
                    },
                    {
                        $addFields: {
                            avatar: "$avatar.url"
                        } 
                    }
                ]
            }
        }
    ]);
    return res
        .status(200)
        .send(new ApiResponse(200, "Subscribers found", subscribers));
});

// Get all subscribed channels of a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    const channels = await Subscription.find({ subscriber: userId }).select("-__v -updatedAt");

    return res
        .status(200)
        .send(new ApiResponse(200, "Channels found", channels));
});

export { subscribeToChannel, unsubscribeFromChannel, getSubscribersOfChannel, getSubscribedChannels };