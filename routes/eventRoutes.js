const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const {
    createEvent,
    updateEvent,
    softDeleteEvent,
    restoreEvent,
    getEventById,
    getTodayEvents,
    getUpcomingEvents,
    getPastEvents,
    getDeletedEvents
} = require("../models/eventModel");

router.use(requireLogin);

// events home – show today/upcoming/past
router.get("/", async (req, res) => {
    const userId = req.session.user.user_id;
    const [today, upcoming, past] = await Promise.all([
        getTodayEvents(userId),
        getUpcomingEvents(userId),
        getPastEvents(userId)
    ]);

    res.render("events/index", {
        title: "My Events",
        today,
        upcoming,
        past,
        active: "events"
    });
});

// new event form
router.get("/new", (req, res) => {
    res.render("events/form", {
        title: "New Event",
        mode: "create",
        event: null,
        active: "events"
    });
});

router.post("/new", async (req, res) => {
    const userId = req.session.user.user_id;
    const { title, description, start_time, end_time, color_hex } = req.body;

    await createEvent(userId, {
        title,
        description,
        start_time,
        end_time,
        color_hex: color_hex || "#2196f3"
    });

    res.redirect("/events");
});

// edit event
router.get("/:id/edit", async (req, res) => {
    const userId = req.session.user.user_id;
    const event = await getEventById(req.params.id, userId);
    if (!event) return res.redirect("/events");

    res.render("events/form", {
        title: "Edit Event",
        mode: "edit",
        event,
        active: "events"
    });
});

router.post("/:id/edit", async (req, res) => {
    const userId = req.session.user.user_id;
    const { title, description, start_time, end_time, color_hex } = req.body;
    await updateEvent(req.params.id, userId, {
        title,
        description,
        start_time,
        end_time,
        color_hex
    });
    res.redirect("/events");
});

// soft delete
router.post("/:id/delete", async (req, res) => {
    const userId = req.session.user.user_id;
    await softDeleteEvent(req.params.id, userId);
    res.redirect("/events");
});

// trash (deleted events)
router.get("/trash/list", async (req, res) => {
    const userId = req.session.user.user_id;
    const events = await getDeletedEvents(userId);
    res.render("events/trash", {
        title: "Trash",
        events,
        active: "events"
    });
});

router.post("/:id/restore", async (req, res) => {
    const userId = req.session.user.user_id;
    await restoreEvent(req.params.id, userId);
    res.redirect("/events/trash/list");
});

module.exports = router;
