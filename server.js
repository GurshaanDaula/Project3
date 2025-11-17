require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const sessionMiddleware = require("./config/sessionStore");
const { attachUserToLocals } = require("./middleware/auth");

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const eventRoutes = require("./routes/eventRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));

// body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// sessions
app.use(sessionMiddleware);

// attach current user to res.locals
app.use(attachUserToLocals);

// routes
app.use(authRoutes);
app.use("/friends", friendRoutes);
app.use("/events", eventRoutes);
app.use("/calendar", calendarRoutes);

// home – redirect based on auth
app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/events");
    }
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
