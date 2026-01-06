const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.sxq7fz8.mongodb.net/${process.env.MONGO_DB}`);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

module.exports = { connectDB };