
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
        lowercase: true
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


        // 8 characters
        // 1 uppercase letter
        // 1 lowercase letter
        // 1 Number
        // 1 special character

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
            if (!['male', 'female', 'other'].includes(value)) {
                throw new Error("Gender must be male, female or other")
            }
        }
    },

    age: {
        type: Number,
        min: 18,
        max: 50,
    },

    about: {
        type: String,
        trim: true,
        lowercase: true,
        default: "This is About field !"
    },

    skills: {
        type: [String]
    },

    photoUrl: {
        type: String,
        default: "https://www.example.com/default-photo.jpg",

        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL for photo")
            }
        }

    }

},{
    collection: "users",
    timestamps: true
}

)

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};