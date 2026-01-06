// .env mai hum is liya bana tay hai takay dosray developer ko asani ho jaye or usko asani se pata lag jaye ke is mai kon konsi key etc use ki hai

const express = require("express");
const { connectDB } = require("./config/database");
const { User } = require("./model/user");
const { Post } = require("./model/post");
const { Comment } = require("./model/comment");
const { auth } = require("./middleware/auth");
const { validateSignup, validateLogin } = require("./lib/utils");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
const port = process.env.PORT || 5000;

// ========================== Signing Up ==========================

app.post('/register', async (req, res) => {
    try {
        validateSignup(req);

        const { name, email, password, gender, age, about, skills, photoUrl } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashPassword,
            gender,
            age,
            about,
            skills,
            photoUrl
        });

        await user.save();
        res.status(201).send({ message: "User registered successfully", user });

    } catch (error) {
        res.status(500).json({ message: "User not registered", error: error.message });
    }
});

// ========================== Logging In ==========================

app.post('/login', async (req, res) => {
    try {
        validateLogin(req);

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie('token', token)

        res.status(200).send({ message: "User logged in successfully", user });

    } catch (error) {
        res.status(500).json({ message: "User not logged in", error: error.message });
    }
});

// ========================== Logging Out ==========================

app.post("/logout", auth, (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out" });
});


// ========================== Apni Profile ke liye ==========================


app.get("/profile", auth, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).send({
            user: req.user,
            posts
        });

    } catch (error) {
        res.status(500).json({ message: "Profile not found" });
    }
});

// ========================== Apni Profile ki Update ==========================

app.put("/updateProfile", auth, async (req, res) => {
    try {
        const updates = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select("-password");

        res.status(200).send({
            message: "Profile updated",
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Profile update failed" });
    }
});


// ========================== Creating Post ==========================

app.post('/post', async (req, res) => {
    try {

        const userId = req.cookies.id;
        if (!userId) return res.status(401).json({ message: "User not logged in" });

        const { content, postUrl, isPublic } = req.body;

        const post = new Post({
            user: userId,
            postUrl,
            content,
            isPublic
        });

        await post.save();
        res.status(201).send({ message: "Post created successfully", post });

    } catch (error) {
        res.status(500).send({ message: "Post not created", error: error.message });
    }
});

// ========================== Edit Post ==========================
app.put('/post/:id', auth, async (req, res) => {
    try {
        const { content, postUrl, isPublic } = req.body;
        const post = await Post.findByIdAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { content, postUrl, isPublic },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
        res.status(200).json({ message: "Post updated", post });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
});

// ========================== Delete Post ==========================
app.delete('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete({ _id: req.params.id, user: req.user._id });
        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
});

// ========================== Likes ==========================
app.post("/post/:id/like", auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likes: post.likes });

    } catch (error) {
        res.status(500).json({ message: "Error liking post", error: error.message });
    }
});

// ========================== Comments ==========================
app.post("/post/:id/comment", auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });

        const comment = new Comment({
            user: req.user._id,
            post: req.params.id,
            content
        });
        await comment.save();

        const post = await Post.findById(req.params.id);
        post.comments.push(comment._id);
        await post.save();

        // Populate user for instant frontend update
        await comment.populate("user", "name photoUrl");

        res.status(201).json({ message: "Comment added", comment });

    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
});

app.get("/post/:id/comments", async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id, parentComment: null })
            .populate("user", "name photoUrl")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" });
    }
});

// Like a comment
app.post("/comment/:id/like", auth, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likes: comment.likes });

    } catch (error) {
        res.status(500).json({ message: "Error liking comment", error: error.message });
    }
});

// Reply to a comment
app.post("/comment/:id/reply", auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });

        const parentComment = await Comment.findById(req.params.id);
        if (!parentComment) return res.status(404).json({ message: "Comment not found" });

        const reply = new Comment({
            user: req.user._id,
            post: parentComment.post,
            content,
            parentComment: req.params.id
        });
        await reply.save();

        await reply.populate("user", "name photoUrl");

        res.status(201).json({ message: "Reply added", reply });

    } catch (error) {
        res.status(500).json({ message: "Error adding reply", error: error.message });
    }
});

// Get replies for a comment
app.get("/comment/:id/replies", async (req, res) => {
    try {
        const replies = await Comment.find({ parentComment: req.params.id })
            .populate("user", "name photoUrl")
            .sort({ createdAt: 1 });

        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching replies" });
    }
});

// ========================== Fetching Posts ==========================

// Get single post by ID
app.get('/post/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "name photoUrl");

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find({ isPublic: true }).populate("user", "name photoUrl").sort({ createdAt: -1 });
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ message: "Posts not found", error: error.message });
    }
});

// ========================== user ki apni profile posts dekhao ==========================

app.get('/profile/posts', async (req, res) => {
    try {
        const userId = req.cookies.id;
        if (!userId) return res.status(404).send("User not logged in");

        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ message: "Posts not found", error: error.message });
    }
});

// ========================== Fetching User Profile ==========================  

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.find({ user: req.params.id, isPublic: true }).sort({ createdAt: -1 });

        res.status(200).send({ user, post });

    } catch (error) {
        res.status(500).send({ message: "Field to get user profile", error: error.message });
    }
})


app.get("/post/:id", async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("user", "name");

    if (!post) return res.status(404).send({ message: "Post not found" });

    res.send(post);
});


connectDB().then(() => {
    console.log("Database connected succesfully");
    app.listen(port, () => {
        console.log("Server is running on port " + port);
    });
}).catch((error) => {
    console.log("database connection failed" + error);
}); 