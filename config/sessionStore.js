const MongoStore = require("connect-mongo");

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        secure: process.env.NODE_ENV === "production"
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        crypto: {
            secret: process.env.SESSION_SECRET
        },
        autoRemove: "interval",
        autoRemoveInterval: 10,
        tls: true,
        tlsAllowInvalidCertificates: false
    })
});

module.exports = sessionMiddleware;
