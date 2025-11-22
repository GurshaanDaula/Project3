// config/sessionStore.js
const session = require("express-session");
const MongoStore = require("connect-mongo");

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60,
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: "lax",
        secure: false, 
    }
});

module.exports = sessionMiddleware;
