const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const {
    sendFriendRequest,
    getFriendshipsForUser,
    getPendingRequestsForUser,
    updateFriendshipStatus
} = require("../models/friendshipModel");
const { searchUsersByUsernamePartial } = require("../models/userModel");

router.use(requireLogin);

router.get("/", async (req, res) => {
    const userId = req.session.user.user_id;
    const friendships = await getFriendshipsForUser(userId);
    const pending = await getPendingRequestsForUser(userId);

    res.render("friends/index", {
        title: "Friends",
        friendships,
        pending,
        searchResults: [],
        error: null,
        active: "friends"
    });
});

router.post("/search", async (req, res) => {
    const userId = req.session.user.user_id;
    const { term } = req.body;
    const friendships = await getFriendshipsForUser(userId);
    const pending = await getPendingRequestsForUser(userId);
    const results = term
        ? await searchUsersByUsernamePartial(term, userId)
        : [];
    res.render("friends/index", {
        title: "Friends",
        friendships,
        pending,
        searchResults: results,
        error: null,
        active: "friends"
    });
});

router.post("/request", async (req, res) => {
    const userId = req.session.user.user_id;
    const { addressee_id } = req.body;
    try {
        await sendFriendRequest(userId, addressee_id);
        res.redirect("/friends");
    } catch (err) {
        console.error(err);
        const friendships = await getFriendshipsForUser(userId);
        const pending = await getPendingRequestsForUser(userId);
        res.render("friends/index", {
            title: "Friends",
            friendships,
            pending,
            searchResults: [],
            error: "Could not send friend request.",
            active: "friends"
        });
    }
});

router.post("/respond", async (req, res) => {
    const { friendship_id, action } = req.body;
    const status = action === "accept" ? "accepted" : "rejected";
    await updateFriendshipStatus(friendship_id, status);
    res.redirect("/friends");
});

module.exports = router;
