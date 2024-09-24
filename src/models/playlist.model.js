import mongoose from "mongoose";

const playlistSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    isPrivate: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true});

export const Playlist = mongoose.model("Playlist", playlistSchema);