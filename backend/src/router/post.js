const express = require("express");
const { Post } = require("../model/post");
const { Comment } = require("../model/comment");
const { auth } = require("../middleware/auth");
const { User } = require("../model/user");
const { Report } = require("../model/report");
const { upload } = require("../config/cloudinary");

const postRouter = express.Router();

// Get all public posts (For You)
postRouter.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find({ isPublic: true, isHidden: { $ne: true } })
            .populate("user", "name photoUrl username isVerified")
            .sort({ isPinned: -1, createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Posts not found", error: error.message });
    }
});

// Get posts from following users
postRouter.get("/posts/following", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.find({
            user: { $in: user.following },
            isPublic: true
        })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching feed", error: error.message });
    }
});

// Get single post by ID
postRouter.get("/post/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "name photoUrl username");

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
});

// Create post
postRouter.post("/post", auth, upload.single("image"), async (req, res) => {
    try {
        const userId = req.user._id;
        const { content, isPublic } = req.body;
        
        // Use cloudinary URL if file is uploaded, otherwise fallback to postUrl in body (if provided)
        const postUrl = req.file ? req.file.path : req.body.postUrl;

        if (!content && !postUrl) {
            return res.status(400).json({ message: "Post content or image is required" });
        }

        const post = new Post({
            user: userId,
            postUrl,
            content,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        await post.save();
        await post.populate("user", "name photoUrl username");

        // Emit real-time new post event
        const io = req.app.io;
        if (io) {
            io.emit('new-post', post);
        }

        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Post not created", error: error.message });
    }
});

// Edit post
postRouter.put("/post/:id", auth, upload.single("image"), async (req, res) => {
    try {
        const { content, isPublic } = req.body;
        let postUrl = req.body.postUrl;
        
        if (req.file) {
            postUrl = req.file.path;
        }

        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { content, postUrl, isPublic },
            { new: true }
        ).populate("user", "name photoUrl username");

        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
        
        const io = req.app.io;
        if (io) {
            io.emit('update-post', post);
        }
        
        res.status(200).json({ message: "Post updated", post });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
});

// Delete post
postRouter.delete("/post/:id", auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
        
        const io = req.app.io;
        if (io) {
            io.emit('delete-post', req.params.id);
        }
        
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
});

// Add comment to post
postRouter.post("/post/:id/comment", auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });

        const post = await Post.findById(req.params.id).populate('user', 'name username photoUrl');
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            user: req.user._id,
            post: req.params.id,
            content
        });
        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        await comment.populate("user", "name photoUrl username");

        // Create notification if commenting on someone else's post
        if (post.user._id.toString() !== req.user._id.toString()) {
            const { Notification } = require("../model/notification");
            
            const notification = await Notification.create({
                recipient: post.user._id,
                sender: req.user._id,
                type: 'reply',
                comment: comment._id,
                post: req.params.id
            });

            // Populate the notification details
            const populatedNotif = await Notification.findById(notification._id)
                .populate('sender', 'name username photoUrl')
                .populate('comment', 'content')
                .populate('post', 'content');

            // Emit socket event to the recipient
            const io = req.app.io;
            if (io) {
                io.to(post.user._id.toString()).emit('new-notification', {
                    type: 'reply',
                    data: populatedNotif
                });
            }
        }

        // Emit real-time comment count update
        const io = req.app.io;
        if (io) {
            io.emit('metrics-update', {
                type: 'post-comment-count',
                postId: req.params.id,
                commentsCount: post.comments.length
            });
            
            // Also emit the new comment for real-time appending
            const commentObj = comment.toObject ? comment.toObject() : comment;
            commentObj.replyCount = 0;
            commentObj.replies = [];
            io.emit('new-comment', { postId: req.params.id, comment: commentObj });
        }

        res.status(201).json({ message: "Comment added", comment });
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
});

// Get comments for a post
postRouter.get("/post/:id/comments", async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id, parentComment: null })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain object to add property

        const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
            const replyCount = await Comment.countDocuments({ parentComment: comment._id });
            const replies = await Comment.find({ parentComment: comment._id })
                .populate("user", "name photoUrl username")
                .sort({ createdAt: 1 });
            return { ...comment, replyCount, replies };
        }));

        res.status(200).json(commentsWithReplies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" });
    }
});

// Report a post
postRouter.post("/post/:id/report", auth, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: "Reason is required" });

        const report = new Report({
            reporter: req.user._id,
            post: req.params.id,
            reason
        });

        await report.save();
        res.status(201).json({ message: "Post reported successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error reporting post", error: error.message });
    }
});

module.exports = { postRouter };
