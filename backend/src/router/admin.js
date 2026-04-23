
const express = require('express');
const router = express.Router();
const { User } = require('../model/user');
const { Post } = require('../model/post');
const { Report } = require('../model/report');
const { auth, adminAuth } = require('../middleware/auth');
const { Notification } = require('../model/notification');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');

// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// ...

// Toggle Verification
router.put('/users/:id/verify', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isVerified = !user.isVerified;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Suspension
router.put('/users/:id/suspend', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isSuspended = !user.isSuspended;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Freeze
router.put('/users/:id/freeze', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isFrozen = !user.isFrozen;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Pin
router.put('/posts/:id/pin', auth, adminAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.isPinned = !post.isPinned;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Trending
router.put('/posts/:id/trending', auth, adminAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.isTrending = !post.isTrending;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get reports (with filter support)
router.get('/reports', auth, adminAuth, async (req, res) => {
    try {
        const { status, reason } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (reason) filter.reason = reason;

        const reports = await Report.find(filter)
            .populate('reporter', 'name username photoUrl')
            .populate({
                path: 'post',
                select: 'content postUrl user reportCount isHidden createdAt',
                populate: { path: 'user', select: 'name username photoUrl' }
            })
            .sort({ createdAt: -1 });

        const stats = {
            total: await Report.countDocuments(),
            pending: await Report.countDocuments({ status: 'pending' }),
            reviewed: await Report.countDocuments({ status: 'reviewed' }),
            rejected: await Report.countDocuments({ status: 'rejected' })
        };

        res.json({ reports, stats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Report Status (pending → reviewed / rejected)
router.put('/reports/:id', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'reviewed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.json({ message: "Report status updated", report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Resolve Report (old route - backward compat)
router.put('/reports/:id/resolve', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Hide/Unhide Post (Admin action from reports)
router.put('/posts/:id/hide', auth, adminAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        post.isHidden = !post.isHidden;
        await post.save();
        res.json({ message: post.isHidden ? "Post hidden" : "Post unhidden", isHidden: post.isHidden });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update post content and status
router.put('/posts/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Handle content
        if (req.body.content !== undefined) {
            post.content = req.body.content;
        }

        // Handle status flags
        if (req.body.isPinned !== undefined) {
            post.isPinned = req.body.isPinned === 'true';
        }
        if (req.body.isTrending !== undefined) {
            post.isTrending = req.body.isTrending === 'true';
        }
        if (req.body.isHidden !== undefined) {
            post.isHidden = req.body.isHidden === 'true';
        }

        // Handle media upload
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'posts',
                resource_type: 'auto'
            });

            // Delete old media if exists
            if (post.postUrl) {
                const publicId = post.postUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`posts/${publicId}`);
            }

            post.postUrl = result.secure_url;

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
        }

        // Handle media removal
        if (req.body.removeMedia === 'true' && post.postUrl) {
            const publicId = post.postUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`posts/${publicId}`);
            post.postUrl = null;
        }

        await post.save();
        res.json(post);
    } catch (err) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: err.message });
    }
});

// Global Broadcast
router.post('/broadcast', auth, adminAuth, async (req, res) => {
    try {
        const { title, message } = req.body;
        // Broadcast = creation of a notification for all users
        const users = await User.find({}, "_id");
        const notifications = users.map(user => ({
            recipient: user._id,
            sender: req.user._id,
            type: "broadcast",
            title,
            message,
            read: false
        }));
        const insertedNotifications = await Notification.insertMany(notifications);
        
        // Emit socket event to all connected users in real-time
        const io = req.app.io;
        if (io) {
            insertedNotifications.forEach(notif => {
                // Populate notification for socket emit
                Notification.findById(notif._id)
                    .populate('sender', 'name username photoUrl')
                    .then(populatedNotif => {
                        io.to(notif.recipient.toString()).emit('new-notification', {
                            type: 'broadcast',
                            data: populatedNotif
                        });
                    })
                    .catch(err => console.error('Error populating broadcast notification:', err));
            });
        }

        res.json({ message: `Broadcast sent to ${users.length} users` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get overall stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const newPosts = await Post.countDocuments({ createdAt: { $gte: last7Days } });
        const newUsers = await User.countDocuments({ createdAt: { $gte: last7Days } });

        res.json({
            stats: [
                { label: "Total Users", value: totalUsers, change: `+${newUsers}`, trend: "up" },
                { label: "Total Posts", value: totalPosts, change: `+${newPosts}`, trend: "up" },
                { label: "Engagement", value: "84%", change: "+5.2%", trend: "up" },
                { label: "Active Sessions", value: "1.2k", change: "+12%", trend: "up" }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user role
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user details (admin)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
    try {
        const allowedUpdates = [
            "name", "username", "email", "about", "location", "website", 
            "gender", "age", "skills", "isVerified", "isSuspended", "isFrozen"
        ];
        
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: "Invalid updates!" });
        }

        // Check if username or email already exists (if being updated)
        if (req.body.username) {
            const existingUser = await User.findOne({ username: req.body.username, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete their posts
        await Post.deleteMany({ user: req.params.id });
        res.json({ message: "User and their posts deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all posts
router.get('/posts', auth, adminAuth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name username photoUrl')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete post
router.delete('/posts/:id', auth, adminAuth, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
