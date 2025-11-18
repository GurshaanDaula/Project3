// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { findByEmailOrUsername, createUser } = require("../models/userModel");

const router = express.Router();

// GET /login
router.get("/login", (req, res) => {
    res.render("auth/login", { title: "Login", error: null });
});

// POST /login
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await findByEmailOrUsername(identifier);

        if (!user) {
            return res.render("auth/login", {
                title: "Login",
                error: "No account found with that email or username."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.render("auth/login", {
                title: "Login",
                error: "Incorrect password."
            });
        }

        // ✅ Save user in session
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        };

        console.log("LOGIN SUCCESS — SESSION SET:", req.session.user);

        // ✅ After login, go to calendar
        return res.redirect("/calendar");
    } catch (err) {
        console.error("Login Error:", err);
        return res.render("auth/login", {
            title: "Login",
            error: "An unexpected error occurred."
        });
    }
});

// GET /signup
router.get("/signup", (req, res) => {
    res.render("auth/signup", { title: "Sign Up", error: null });
});

// POST /signup
router.post("/signup", async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existing = await findByEmailOrUsername(email)
            || await findByEmailOrUsername(username);

        if (existing) {
            return res.render("auth/signup", {
                title: "Sign Up",
                error: "That email or username is already in use."
            });
        }

        const password_hash = await bcrypt.hash(password, 10);
        await createUser(email, username, password_hash);

        // ✅ After signup, go to login
        return res.redirect("/login");
    } catch (err) {
        console.error("Signup Error:", err);
        return res.render("auth/signup", {
            title: "Sign Up",
            error: "An unexpected error occurred."
        });
    }
});

// GET /logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
