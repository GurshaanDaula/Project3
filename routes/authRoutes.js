const express = require("express");
const bcrypt = require("bcryptjs");
const { findByEmailOrUsername } = require("../models/userModel");

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("auth/login", { error: null });
});

router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Find user
        const user = await findByEmailOrUsername(identifier);

        if (!user) {
            return res.render("auth/login", { error: "No account found with that email or username." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.render("auth/login", { error: "Incorrect password." });
        }

        // Store session
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        };

        console.log("LOGIN SUCCESS — SESSION SET:", req.session.user);

        return res.redirect("/calendar/index");
    } catch (err) {
        console.error("Login Error:", err);
        return res.render("auth/login", { error: "An unexpected error occurred" });
    }
});

module.exports = router;
