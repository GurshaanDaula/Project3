const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { getEventsInRange } = require("../models/eventModel");

router.use(requireLogin);

router.get("/", async (req, res) => {
    const userId = req.session.user.user_id;

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay()); // start of week Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const fromStr = start.toISOString().slice(0, 10) + " 00:00:00";
    const toStr = end.toISOString().slice(0, 10) + " 23:59:59";

    const events = await getEventsInRange(userId, fromStr, toStr);

    res.render("calendar/index", {
        title: "Calendar",
        events,
        weekStart: start.toISOString().slice(0, 10),
        weekEnd: end.toISOString().slice(0, 10),
        active: "calendar"
    });
});

module.exports = router;
