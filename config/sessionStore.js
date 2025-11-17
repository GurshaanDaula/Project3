require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        crypto: { secret: process.env.SESSION_SECRET }
    })
});

module.exports = sessionMiddleware;
