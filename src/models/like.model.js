import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
    comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
        },
    isLiked: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true});

export const Like = mongoose.model("Like", likeSchema);