import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/fileUpload.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { filesValidation, updateVideoDetailsValidation, videoDetailsValidation } from "../helpers/schema-validations/user.schemavalidation.js";

// Get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Video found", video));
});

// Get all videos by user id
const getAllVideosByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Invalid user id");
    }

    const videos = await Video.aggregate([{
        $match: {
            owner: new mongoose.Types.ObjectId(id)
        }
    }]);

    return res.
    status(200).
    send(new ApiResponse(200, "Videos found", videos));
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const {id} = req.params;
    if (!id) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    await deleteFromCloudinary(video?.videoFile?.publicId);

    return res.
    status(200).
    send(new ApiResponse(200, "Video deleted successfully", video));
});

// Upload video
const uploadVideo = asyncHandler(async (req, res) => {
    // validate request body fields
    const result = await videoDetailsValidation.validateAsync(req.body);
    const { title, description, owner, isPublished } = result;

    // validate request files
    const files = await filesValidation.validateAsync(req.files);

    const localVideoPath = files['videoFile'][0].path;
    const localThumbnailPath = files['thumbnail'][0].path;

    const videoResponse = await uploadOnCloudinary(localVideoPath);
    const thumbnailResponse = await uploadOnCloudinary(localThumbnailPath);

    if (!videoResponse || !thumbnailResponse) {
        throw new ApiError(500, "Error uploading video or thumbnail");
    }

    const video = await Video.create({
        title,
        description,
        owner,
        videoFile: { url: videoResponse.url, publicId: videoResponse.public_id },
        thumbnail: { url: thumbnailResponse.url, publicId: thumbnailResponse.public_id },
        duration: videoResponse.duration,
        isPublished
    });

    if (!video) {
        throw new ApiError(500, "Error uploading video");
    }

    return res.
    status(201).
    send(new ApiResponse(201, "Video uploaded successfully", video));
});

// Toggle publish status of video
const togglePublishStatusOfVideo = asyncHandler(async(req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Invalid video id");
    }

    const prevVideo = await Video.findById(id);
    if (!prevVideo) {
        throw new ApiError(404, "Video not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(id, { isPublished: !prevVideo.isPublished }, { new: true}).select("-__v -updatedAt -createdAt");

    if (!updatedVideo) {
        throw new ApiError(500, "Error updating video");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Video publish status updated successfully", updatedVideo));
});

// Update video details
const updateVideoDetails = asyncHandler(async(req, res) => {
    // validate request body fields
    const result = await updateVideoDetailsValidation.validateAsync({...req.body, thumbnail: req.file});
    const { id, title, description, thumbnail } = result;

    const updateBody = {};

    if (title) {
        updateBody.title = title;
    }
    if (description) {
        updateBody.description = description;
    }
    if (thumbnail) {
        const previousVideo = await Video.findById(id);
        const localThumbnailPath = thumbnail.path;
        const thumbnailResponse = await uploadOnCloudinary(localThumbnailPath);
        if (!thumbnailResponse) {
            throw new ApiError(500, "Error uploading thumbnail");
        }
        await deleteFromCloudinary(previousVideo.thumbnail.publicId);
        updateBody.thumbnail = {url: thumbnailResponse.url, publicId: thumbnailResponse.public_id};
    }

    const video = await Video.findByIdAndUpdate(id, updateBody, { new: true}).select("-__v -updatedAt -createdAt");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Video updated successfully", video));
});

export { getVideoById, getAllVideosByUserId, deleteVideo, uploadVideo, togglePublishStatusOfVideo, updateVideoDetails };