const express = require("express");
const { Report } = require("../model/report");
const { Post } = require("../model/post");
const { Notification } = require("../model/notification");
const { User } = require("../model/user");
const { auth } = require("../middleware/auth");

const reportRouter = express.Router();

// ============= Report Reasons List =============
const REPORT_REASONS = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "nudity", label: "Nudity / Sexual Content" },
    { value: "fake_info", label: "Fake Information" },
    { value: "other", label: "Other" }
];

// ============= GET Report Reasons =============
reportRouter.get("/report/reasons", (req, res) => {
    res.json(REPORT_REASONS);
});

// ============= Submit Report =============
reportRouter.post("/post/:id/report", auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const { reason, description } = req.body;

        // Validate reason
        if (!reason) {
            return res.status(400).json({ message: "Report reason is required" });
        }

        const validReasons = REPORT_REASONS.map(r => r.value);
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ message: "Invalid report reason" });
        }

        // Other ke liye description required
        if (reason === "other" && (!description || !description.trim())) {
            return res.status(400).json({ message: "Please describe the issue" });
        }

        // Check karo ke post exist kare
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Apni post report nahi kar sakte
        if (String(post.user) === String(userId)) {
            return res.status(400).json({ message: "You cannot report your own post" });
        }

        // Duplicate check - ek user ek post ko sirf 1 baar report kare
        const existingReport = await Report.findOne({ reporter: userId, post: postId });
        if (existingReport) {
            return res.status(409).json({ message: "You have already reported this post" });
        }

        // Rate limit - Ek user max 5 reports per day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayReports = await Report.countDocuments({
            reporter: userId,
            createdAt: { $gte: todayStart }
        });
        if (todayReports >= 5) {
            return res.status(429).json({ message: "Daily report limit reached (max 5 per day)" });
        }

        // Report save karo
        const report = new Report({
            reporter: userId,
            post: postId,
            reason,
            description: description?.trim() || ""
        });
        await report.save();

        // Post ka reportCount increase karo
        post.reportCount = (post.reportCount || 0) + 1;

        // Auto moderation: 10 reports → auto hide
        if (post.reportCount >= 10) {
            post.isHidden = true;
        }

        await post.save();

        // Admin ko notification bhejo
        const admins = await User.find({ role: "admin" }, "_id");
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                recipient: admin._id,
                sender: userId,
                type: "report",
                post: postId,
                read: false
            }));

            // Notification model check - agar "report" type allowed nahi toh skip
            try {
                await Notification.insertMany(notifications);
            } catch (notifErr) {
                // Notification fail hone pe report fail nahi honi chahiye
                console.log("Notification error (non-critical):", notifErr.message);
            }
        }

        res.status(201).json({
            message: "Report submitted successfully",
            reportCount: post.reportCount,
            isHidden: post.isHidden
        });

    } catch (error) {
        // Duplicate key error (mongoose unique index)
        if (error.code === 11000) {
            return res.status(409).json({ message: "You have already reported this post" });
        }
        res.status(500).json({ message: "Error submitting report", error: error.message });
    }
});

// ============= Get My Reports (User History) =============
reportRouter.get("/my-reports", auth, async (req, res) => {
    try {
        const reports = await Report.find({ reporter: req.user._id })
            .populate({
                path: "post",
                select: "content postUrl user createdAt",
                populate: { path: "user", select: "name username photoUrl" }
            })
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports" });
    }
});

// ============= Check if User Already Reported a Post =============
reportRouter.get("/post/:id/report/check", auth, async (req, res) => {
    try {
        const existing = await Report.findOne({
            reporter: req.user._id,
            post: req.params.id
        });
        res.json({ reported: !!existing });
    } catch (error) {
        res.status(500).json({ message: "Error checking report status" });
    }
});

module.exports = { reportRouter };
