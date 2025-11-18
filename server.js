// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const sessionMiddleware = require("./config/sessionStore");
const requireLogin = require("./middleware/requireLogin");

// Routes
const authRoutes = require("./routes/authRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const eventsRoutes = require("./routes/eventRoutes");
const friendsRoutes = require("./routes/friendRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");
app.use(expressLayouts);

// Body parsing
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Sessions
app.use(sessionMiddleware);

// Make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Public routes: login + signup (no auth required)
app.use("/", authRoutes);

// 🔒 Everything below this line requires login
app.use(requireLogin);

// Protected routes
app.use("/calendar", calendarRoutes);
app.use("/events", eventsRoutes);
app.use("/friends", friendsRoutes);

// Default root → calendar
app.get("/", (req, res) => {
    res.redirect("/calendar");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
