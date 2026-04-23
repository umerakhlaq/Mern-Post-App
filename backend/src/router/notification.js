const express = require('express');
const { Notification } = require('../model/notification');
const { auth } = require('../middleware/auth');

const notificationRouter = express.Router();

// Get notification
notificationRouter.get('/notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name username photoUrl')
            .populate('post', 'content')
            .populate('comment', 'content')
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
});

// Mark all as read
notificationRouter.put('/notifications/read', auth, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications", error: error.message });
    }
});

// Delete notification
notificationRouter.delete('/notifications/:id', auth, async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notification", error: error.message });
    }
});

module.exports = { notificationRouter };
