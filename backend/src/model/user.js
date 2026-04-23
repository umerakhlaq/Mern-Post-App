
const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined to not conflict
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email Address")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Password is not strong enough")
            }
        }
    },
    gender: {
        type: String,
        lowercase: true,
        validate(value) {
            if (value && !['male', 'female', 'other'].includes(value)) {
                throw new Error("Gender must be male, female or other")
            }
        }
    },
    age: {
        type: Number,
        min: 18,
        max: 100,
    },
    about: {
        type: String,
        trim: true,
        maxLength: 160, // Standard bio length
        default: ""
    },
    location: {
        type: String,
        trim: true,
        maxLength: 30,
        default: ""
    },
    website: {
        type: String,
        trim: true,
        validate(value) {
            if (value && !validator.isURL(value)) {
                throw new Error("Invalid URL")
            }
        }
    },
    skills: {
        type: [String]
    },
    photoUrl: {
        type: String,
        default: "",
        validate(value) {
            if (value && !validator.isURL(value)) {
                throw new Error("Invalid URL for photo")
            }
        }
    },
    coverUrl: {
        type: String,
        default: "",
        validate(value) {
            if (value && !validator.isURL(value)) {
                throw new Error("Invalid URL for cover")
            }
        }
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    bookmarks: [{
        type: Schema.Types.ObjectId,
        ref: "Post"
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isFrozen: {
        type: Boolean,
        default: false
    }
}, {
    collection: "users",
    timestamps: true
});

userSchema.index({ name: 'text', username: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};