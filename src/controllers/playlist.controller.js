import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPrivate, videos } = req.body;
    const owner = req.user._id;

    if(!name) {
        throw new ApiError(400, "Name is required");
    }

    if ( !videos || videos.length === 0) {
        throw new ApiError(400, "Videos are required");
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner,
        videos,
        isPrivate,
    });

    if (!newPlaylist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    const {__v, createdAt, updatedAt, ...playlist} = newPlaylist._doc;

    return res.
    status(201).
    send(new ApiResponse(201, "Playlist created successfully", playlist));
});

// Update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPrivate, videos, playlistId } = req.body;

    if(!name) {
        throw new ApiError(400, "Name is required");
    }

    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required");
    }

    if ( !videos || videos.length === 0) {
        throw new ApiError(400, "Videos are required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description,
        videos,
        isPrivate,
    }, { new: true }).select("-__v -updatedAt -createdAt");

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Playlist updated successfully", updatedPlaylist));
});

// Get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $project: {
                __v: 0,
                updatedAt: 0,
                createdAt: 0,
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            __v: 0,
                            createdAt: 0,
                        }
                    }
                ]
            }
        }
    ]);

    return res.
    status(200).
    send(new ApiResponse(200, "Playlists fetched successfully", playlists));
});

// Get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required");
    }

    const playlist = await Playlist.findById(playlistId).select("-__v -updatedAt");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Playlist found", playlist));
});

// Add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoIds } = req.body;
    if (!playlistId) {
        throw new ApiError(400, "Playlist id and video id are required");
    }

    if (!videoIds || videoIds.length === 0) {
        throw new ApiError(400, "Video id is required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,  {$addToSet: { videos: videoIds}} , {new: true}).select("-__v -updatedAt -createdAt");
    console.log('addVideoToPlaylist ~ updatedPlaylist->', updatedPlaylist);

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Video added to playlist successfully", updatedPlaylist));
});

// Remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.body;
   
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist id and video id are required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {$pull: { videos: videoId}} , {new: true}).select("-__v -updatedAt -createdAt");

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Video removed from playlist successfully", updatedPlaylist));
});

// Delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Playlist deleted successfully", deletedPlaylist));
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };