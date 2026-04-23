const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/database");

// Load environment variables
dotenv.config();

// Import routers
const { authRouter } = require("./router/auth");
const { profileRouter } = require("./router/user");
const { postRouter } = require("./router/post");
const { likeRouter } = require("./router/like");
const { commentRouter } = require("./router/comment");
const { notificationRouter } = require("./router/notification");
const { reportRouter } = require("./router/report");
const adminRouter = require("./router/admin");

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Make io accessible to routes
app.io = io;

// Store connected users
app.connectedUsers = {};

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // User joins with their ID
    socket.on('user-join', (userId) => {
        socket.join(userId);
        app.connectedUsers[userId] = socket.id;
        console.log(`User ${userId} joined room with socket ${socket.id}`);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from connectedUsers
        for (let userId in app.connectedUsers) {
            if (app.connectedUsers[userId] === socket.id) {
                delete app.connectedUsers[userId];
                break;
            }
        }
    });
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/", authRouter);           // /register, /login, /logout
app.use("/", profileRouter);        // /profile, /updateProfile, /users/:id
app.use("/", postRouter);           // /post, /posts, /post/:id
app.use("/", likeRouter);           // /post/:id/like
app.use("/", commentRouter);        // /comment/:id/reply, /comment/:id/replies
app.use("/", notificationRouter);   // /notifications
app.use("/", reportRouter);         // /post/:id/report, /my-reports
app.use("/admin", adminRouter);      // /admin/stats, /admin/users, /admin/posts

// Port
const port = process.env.PORT || 3000;

// Connect to database and start server
connectDB().then(() => {
    console.log("Database connected successfully");
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch((error) => {
    console.log("Database connection failed: " + error);
});