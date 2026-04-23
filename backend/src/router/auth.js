const express = require("express");
const { User } = require("../model/user");
const { auth } = require("../middleware/auth");
const { validateSignup, validateLogin } = require("../lib/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

// REGISTER
authRouter.post("/register", async (req, res) => {
  try {
    validateSignup(req);

    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashPassword
    });

    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    validateLogin(req);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended by the admin." });
    }

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax"
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: "Login success", user: safeUser });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGOUT
authRouter.post("/logout", auth, (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

module.exports = { authRouter };
