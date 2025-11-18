
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Must match your .env value
const mongoUrl = process.env.MONGO_URI;

const store = MongoStore.create({
    mongoUrl,
    ttl: 60 * 60, // 1 hour session expiry
    autoRemove: "interval",
    autoRemoveInterval: 10,
});

// Export ready-to-use middleware
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
        secure: process.env.NODE_ENV === "production"
    }
});

module.exports = sessionMiddleware;
