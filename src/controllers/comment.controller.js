import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Delete replies
const deleteReplies = async (comments) => {
    for(let i = 0; i < comments.length; i++) {
        const comment = await Comment.findByIdAndDelete(comments[i]);
        if (comment?.replies?.length > 0) {
            await deleteReplies(comment.replies);
        }
    }
};

// Populate replies
const populateReplies = (depth) => {
    // base case for recursion
    if (depth <= 1) {
      return [
        { path: 'commentedBy', select: "avatar username fullName" , options: { strictPopulate: false } },
      ];
    }
    // recursive case
    return [
      {
        path: 'replies',
        select: 'content repliedBy replies',
        populate: populateReplies(depth - 1), // Recursive population for replies
      },
      { path: 'commentedBy', select: "avatar username fullName", options: { strictPopulate: false } },
    ];
  };

// Create comment
const createComment = asyncHandler(async (req, res) => {
    const { videoId, comment } = req.body;
    const userId = req.user._id;

    if (!videoId || !comment) {
        throw new ApiError(400, "Video id and comment are required");
    }

    const newComment = await Comment.create({
        videoId,
        commentedBy: userId,
        content: comment,
    });

    if (!newComment) {
        throw new ApiError(500, "Failed to post comment");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Comment posted successfully", newComment));
});

// Update comment
const updateComment = asyncHandler(async (req, res) => {
    const { id, comment } = req.body;
    if (!id || !comment) {
        throw new ApiError(400, "Comment id and comment are required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(id, { content: comment }, { new: true });

    if (!updatedComment) {
        throw new ApiError(500, "Failed to update comment");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Comment id is required");
    }

    const deletedComment = await Comment.findByIdAndDelete(id);
    if (deletedComment?.replies?.length > 0) {
        await deleteReplies(deletedComment.replies);
    }

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Comment deleted successfully", deletedComment));
});

// Get all comments by videoId
const getAllCommentsByVideoId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "Video id is required");
    }

    // 4 levels of replies if you wish to increase or decrease change the number
    const comments = await Comment.find({ videoId: id }).populate(populateReplies(6));

    return res.
    status(200).
    send(new ApiResponse(200, "Comments found", comments));
});

// Reply to comment
const replyToComment = asyncHandler(async (req, res) => {
    const { commentId, reply } = req.body;
    const userId = req.user._id;

    if (!commentId || !reply) {
        throw new ApiError(400, "Comment id and reply are required");
    }

    const newComment = await Comment.create({
        commentedBy: userId,
        content: reply,
    });
    console.log('replyToComment ~ newComment->', newComment);

    if (!newComment) {
        throw new ApiError(500, "Failed to post reply");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, { $push: { replies: newComment._id } }, { new: true });
    console.log('replyToComment ~ updatedComment->', updatedComment);

    if (!updatedComment) {
        throw new ApiError(500, "Failed to post reply");
    }

    return res.
    status(200).
    send(new ApiResponse(200, "Reply posted successfully", updatedComment));
});

export { createComment, updateComment, deleteComment, getAllCommentsByVideoId, replyToComment };