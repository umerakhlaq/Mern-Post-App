const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const validator = require("validator");
const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,          // post kisne banai 
        ref: "User",
        required: true
    },
    content: {
        type: String  // text content agar ho 
    },
    postUrl: {
        type: String, // agar koi photo reel ho 
        // required: true,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL for photo")
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPublic: {
        type: Boolean,
        default: true  // public/private route
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User"
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: "Comment"
    }

}, {
    timestamps: true,
    collection: "posts"
}
)

const Post = mongoose.model("Post", postSchema);
module.exports = {
    Post
}