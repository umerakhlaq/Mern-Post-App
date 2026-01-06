const jwt = require("jsonwebtoken");
const { User } = require("../model/user");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).send("Unauthorized - Token missing");

        // 🔥 Pehle token verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 decoded.id se user find karo
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).send("User not found");

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};

module.exports = { auth };
