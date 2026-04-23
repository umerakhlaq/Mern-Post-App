const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
    reporter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    reason: {
        type: String,
        enum: ["spam", "harassment", "hate_speech", "nudity", "fake_info", "other"],
        required: true
    },
    description: {
        type: String,
        maxLength: 500,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true,
    collection: "reports"
});

// Ek user ek post ko sirf 1 baar report kar sake
reportSchema.index({ reporter: 1, post: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
module.exports = { Report };
