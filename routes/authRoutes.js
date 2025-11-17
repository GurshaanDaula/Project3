const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { findByEmailOrUsername, createUser } = require("../models/userModel");

// password validation: >=10 chars, upper, lower, digit, symbol
function isStrongPassword(pw) {
    return (
        pw.length >= 10 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /[0-9]/.test(pw) &&
        /[^A-Za-z0-9]/.test(pw)
    );
}

router.get("/login", (req, res) => {
    res.render("auth/login", { title: "Login", error: null, active: null });
});

router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;
    const user = await findByEmailOrUsername(identifier);
    if (!user) {
        return res.render("auth/login", {
            title: "Login",
            error: "Invalid credentials.",
            active: null
        });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.render("auth/login", {
            title: "Login",
            error: "Invalid credentials.",
            active: null
        });
    }
    req.session.user = {
        user_id: user.user_id,
        username: user.username,
        email: user.email
    };
    res.redirect("/events");
});

router.get("/signup", (req, res) => {
    res.render("auth/signup", { title: "Sign Up", error: null, active: null });
});

router.post("/signup", async (req, res) => {
    const { email, username, password } = req.body;

    if (!isStrongPassword(password)) {
        return res.render("auth/signup", {
            title: "Sign Up",
            error:
                "Password must be at least 10 characters and include upper, lower, number, and symbol.",
            active: null
        });
    }

    const existingByEmail = await findByEmailOrUsername(email);
    const existingByUsername = await findByEmailOrUsername(username);
    if (existingByEmail || existingByUsername) {
        return res.render("auth/signup", {
            title: "Sign Up",
            error: "Email or username already in use.",
            active: null
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = await createUser(email, username, hash);

    req.session.user = { user_id: userId, username, email };
    res.redirect("/events");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
