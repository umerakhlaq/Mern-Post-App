const express = require("express");
const { Post } = require("../model/post");
const { auth } = require("../middleware/auth");
const { Notification } = require("../model/notification");

const likeRouter = express.Router();

// Toggle like on a post
likeRouter.post("/post/:id/like", auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId).populate('user', 'name username photoUrl');
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes.pull(userId);
            // Optionally remove notification if needed, but not strictly required
            await Notification.findOneAndDelete({
                recipient: post.user,
                sender: userId,
                type: 'like',
                post: postId
            });
        } else {
            post.likes.push(userId);

            // Create notification if liking someone else's post
            if (post.user._id.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    recipient: post.user._id,
                    sender: userId,
                    type: 'like',
                    post: postId
                });

                // Populate the notification details
                const populatedNotif = await Notification.findById(notification._id)
                    .populate('sender', 'name username photoUrl')
                    .populate('post', 'content');

                // Emit socket event to the recipient
                const io = req.app.io;
                if (io) {
                    io.to(post.user._id.toString()).emit('new-notification', {
                        type: 'like',
                        data: populatedNotif
                    });
                }
            }
        }

        await post.save();

        // Emit real-time like count update to all connected users
        const io = req.app.io;
        if (io) {
            io.emit('metrics-update', {
                type: 'post-like-count',
                postId: postId,
                likesCount: post.likes.length,
                isLiked: !isLiked
            });
        }

        res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: "Error toggling like", error: error.message });
    }
});

module.exports = { likeRouter };