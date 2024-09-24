import mongoose from "mongoose";

const tweetSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        require: true
    },
}, { timestamps: true});

export const Tweet = mongoose.model("Tweet", tweetSchema);