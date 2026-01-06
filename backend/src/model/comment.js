const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, {
    timestamps: true,
    collection: "comments"
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = {
    Comment
};