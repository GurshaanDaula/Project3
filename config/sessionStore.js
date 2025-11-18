require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");

store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    mongoOptions: {
        serverSelectionTimeoutMS: 10000,
        ssl: true,
        tlsAllowInvalidCertificates: true
    },
    crypto: { secret: process.env.SESSION_SECRET }
})


module.exports = sessionMiddleware;
