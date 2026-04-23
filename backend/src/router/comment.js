const express = require("express");
const { Comment } = require("../model/comment");
const { auth } = require("../middleware/auth");
const { Notification } = require("../model/notification");
const { Post } = require("../model/post");

const commentRouter = express.Router();

// Like a comment
commentRouter.post("/comment/:id/like", auth, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            comment.likes.pull(userId);
            // Remove notification
            await Notification.findOneAndDelete({
                recipient: comment.user,
                sender: userId,
                type: 'like',
                comment: commentId
            });
        } else {
            comment.likes.push(userId);

            // Create notification if liking someone else's comment
            if (comment.user.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    recipient: comment.user,
                    sender: userId,
                    type: 'like',
                    comment: commentId
                });

                // Populate the notification details
                const populatedNotif = await Notification.findById(notification._id)
                    .populate('sender', 'name username photoUrl')
                    .populate('comment', 'content');

                // Emit socket event to the recipient
                const io = req.app.io;
                if (io) {
                    io.to(comment.user.toString()).emit('new-notification', {
                        type: 'like',
                        data: populatedNotif
                    });
                }
            }
        }

        await comment.save();

        // Emit real-time comment like count update
        const io = req.app.io;
        if (io) {
            io.emit('metrics-update', {
                type: 'comment-like-count',
                commentId: commentId,
                likesCount: comment.likes.length
            });
        }

        res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likes: comment.likes });
    } catch (error) {
        res.status(500).json({ message: "Error liking comment", error: error.message });
    }
});

// Reply to a comment OR Add Comment to Post (Wait, standard post comment was in post.js. This is nested reply)
commentRouter.post("/comment/:id/reply", auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });

        const parentComment = await Comment.findById(req.params.id);
        if (!parentComment) return res.status(404).json({ message: "Comment not found" });

        const reply = new Comment({
            user: req.user._id,
            post: parentComment.post,
            content,
            parentComment: req.params.id
        });
        await reply.save();

        await reply.populate("user", "name photoUrl");

        // Notify parent comment author
        if (parentComment.user.toString() !== req.user._id.toString()) {
            const notification = await Notification.create({
                recipient: parentComment.user,
                sender: req.user._id,
                type: 'reply',
                comment: reply._id,
                post: parentComment.post
            });

            // Populate the notification details
            const populatedNotif = await Notification.findById(notification._id)
                .populate('sender', 'name username photoUrl')
                .populate('comment', 'content')
                .populate('post', 'content');

            // Emit socket event to the recipient
            const io = req.app.io;
            if (io) {
                io.to(parentComment.user.toString()).emit('new-notification', {
                    type: 'reply',
                    data: populatedNotif
                });
            }
        }

        res.status(201).json({ message: "Reply added", reply });
    } catch (error) {
        res.status(500).json({ message: "Error adding reply", error: error.message });
    }
});

// Get replies for a comment
commentRouter.get("/comment/:id/replies", async (req, res) => {
    try {
        const replies = await Comment.find({ parentComment: req.params.id })
            .populate("user", "name photoUrl")
            .sort({ createdAt: 1 });

        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching replies" });
    }
});

module.exports = { commentRouter };