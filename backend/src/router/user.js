const express = require("express");
const { User } = require("../model/user");
const { Post } = require("../model/post");
const { auth } = require("../middleware/auth");
const { Notification } = require("../model/notification");
const { upload } = require("../config/cloudinary");

const profileRouter = express.Router();

// Get own profile
profileRouter.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('followers', 'name photoUrl').populate('following', 'name photoUrl');
        if (!user) return res.status(404).json({ message: "User not found" });
        
        const posts = await Post.find({ user: req.user._id })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            user,
            posts
        });
    } catch (error) {
        res.status(500).json({ message: "Profile not found", error: error.message });
    }
});

// Update profile
profileRouter.put("/updateProfile", auth, upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]), async (req, res) => {
    try {
        const allowedUpdates = [
            "name", "username", "about", "location", "website", 
            "photoUrl", "coverUrl", "gender", "age", "skills"
        ];
        
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: "Invalid updates!" });
        }

        const user = await User.findById(req.user._id);

        if (req.files) {
            if (req.files.photo) {
                user.photoUrl = req.files.photo[0].path;
            }
            if (req.files.cover) {
                user.coverUrl = req.files.cover[0].path;
            }
        }
        
        updates.forEach((update) => {
            if (update !== "photoUrl" && update !== "coverUrl") {
                user[update] = req.body[update];
            }
        });
        
        // Handle username checking
        if (req.body.username) {
            const existingUser = await User.findOne({ username: req.body.username, _id: { $ne: req.user._id } });
            if (existingUser) return res.status(400).json({ message: "Username already taken" });
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Profile update failed", error: error.message });
    }
});

// Delete profile
profileRouter.delete("/deleteProfile", auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        // Delete all posts by user
        await Post.deleteMany({ user: req.user._id });
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "User deletion failed", error: error.message });
    }
});

// Search Users
profileRouter.get("/users/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        }).select("name username photoUrl email").limit(10);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

// Get suggested users to follow
profileRouter.get("/users/suggestions", auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        
        const users = await User.find({
            _id: { $ne: req.user._id, $nin: currentUser.following }
        })
        .select("name username photoUrl email")
        .limit(5);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching suggestions", error: error.message });
    }
});

// Get other user's profile
// Get user's liked posts
profileRouter.get("/users/:id/likes", async (req, res) => {
    try {
        const posts = await Post.find({ likes: req.params.id })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch liked posts", error: error.message });
    }
});

// Get user's media posts
profileRouter.get("/users/:id/media", async (req, res) => {
    try {
        const posts = await Post.find({ 
            user: req.params.id,
            postUrl: { $ne: null, $ne: "" } 
        })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch media posts", error: error.message });
    }
});

profileRouter.get("/users/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate('followers', 'name photoUrl')
            .populate('following', 'name photoUrl');

        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.find({ user: req.params.id, isPublic: true })
            .populate("user", "name photoUrl username")
            .sort({ createdAt: -1 });

        // Check if current user is following this user
        const isFollowingByCurrentUser = user.followers?.some(f => 
            f._id.toString() === req.user._id.toString()
        ) || false;

        // Check if this user is following the current user
        const isFollowingCurrentUser = user.following?.some(f =>
            f._id.toString() === req.user._id.toString()
        ) || false;

        res.status(200).json({ 
            user, 
            posts,
            isFollowingByCurrentUser,
            isFollowingCurrentUser
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get user profile", error: error.message });
    }
});

// Follow / Unfollow User
profileRouter.post("/user/:id/follow", auth, async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(req.params.id);

        if (isFollowing) {
            currentUser.following.pull(req.params.id);
            userToFollow.followers.pull(req.user._id);
            await currentUser.save();
            await userToFollow.save();

             await Notification.findOneAndDelete({
                recipient: userToFollow._id, 
                sender: currentUser._id, 
                type: 'follow'
            });

            // Emit real-time updates
            const io = req.app.io;
            if (io) {
                // Emit notification deletion event to profile owner
                io.to(userToFollow._id.toString()).emit('notification-deleted', {
                    type: 'follow',
                    senderId: currentUser._id,
                    recipientId: userToFollow._id
                });

                // Emit button state update to current user (unfollow happened)
                io.to(currentUser._id.toString()).emit('follow-state-change', {
                    targetUserId: userToFollow._id,
                    isFollowing: false
                });

                // Emit button state update to profile owner (they lost a follower)
                io.to(userToFollow._id.toString()).emit('follow-state-change', {
                    targetUserId: currentUser._id,
                    isFollowedByThis: false
                });

                // Send updated counts to all connected clients
                io.emit('metrics-update', {
                    type: 'follower-count',
                    userId: userToFollow._id,
                    followersCount: userToFollow.followers.length
                });
                io.emit('metrics-update', {
                    type: 'following-count',
                    userId: currentUser._id,
                    followingCount: currentUser.following.length
                });
            }

            res.status(200).json({ message: "Unfollowed", isFollowing: false });
        } else {
            currentUser.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
            await currentUser.save();
            await userToFollow.save();

            const notification = await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });

            // Populate the notification details
            const populatedNotif = await Notification.findById(notification._id)
                .populate('sender', 'name username photoUrl')
                .populate('recipient', 'name username photoUrl');

            // Emit socket events
            const io = req.app.io;
            if (io) {
                // Send notification to the profile owner
                io.to(userToFollow._id.toString()).emit('new-notification', {
                    type: 'follow',
                    data: populatedNotif
                });

                // Emit button state update to current user (follow happened)
                io.to(currentUser._id.toString()).emit('follow-state-change', {
                    targetUserId: userToFollow._id,
                    isFollowing: true
                });

                // Emit button state update to profile owner (they got a new follower)
                io.to(userToFollow._id.toString()).emit('follow-state-change', {
                    targetUserId: currentUser._id,
                    isFollowedByThis: true
                });

                // Send updated counts to all connected clients
                io.emit('metrics-update', {
                    type: 'follower-count',
                    userId: userToFollow._id,
                    followersCount: userToFollow.followers.length
                });
                io.emit('metrics-update', {
                    type: 'following-count',
                    userId: currentUser._id,
                    followingCount: currentUser.following.length
                });
            }

            res.status(200).json({ message: "Followed", isFollowing: true });
        }
    } catch (error) {
        res.status(500).json({ message: "Wait, something went wrong", error: error.message });
    }
});

module.exports = { profileRouter };
