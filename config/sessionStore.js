require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Create session middleware
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        mongoOptions: {
            serverSelectionTimeoutMS: 10000,
            ssl: true,
            tlsAllowInvalidCertificates: true
        },
        crypto: { secret: process.env.SESSION_SECRET }
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        sameSite: "lax",
        secure: false // change to true if using HTTPS domain
    }
});

module.exports = sessionMiddleware;
