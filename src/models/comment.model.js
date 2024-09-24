import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = mongoose.Schema({
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        require: true
    },
    video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
    reply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
}, { timestamps: true});

commentSchema.plugin(mongooseAggregatePaginate); // gives ability to paginate

export const Comment = mongoose.model("Comment", commentSchema);