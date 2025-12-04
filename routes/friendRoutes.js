// routes/friendRoutes.js
const express = require("express");
const router = express.Router();

const {
    sendFriendRequest,
    getFriendshipsForUser,
    getPendingRequestsForUser,
    updateFriendshipStatus,
    cancelFriendRequest,
    removeFriend,
    friendshipExists
} = require("../models/friendshipModel");

const { searchUsersByUsernamePartial } = require("../models/userModel");

// NOTE: requireLogin is already applied globally in server.js with app.use(requireLogin);
// so we don't need router.use(requireLogin) here.

function splitFriendData(friendships, userId) {
    const friends = [];
    const outgoing = [];

    for (const f of friendships) {
        if (f.status === "accepted") {
            friends.push(f);
        } else if (f.status === "pending" && f.requester_id === userId) {
            outgoing.push(f);
        }
    }

    return { friends, outgoing };
}

// GET /friends
router.get("/", async (req, res) => {
    const userId = req.session.user.user_id;

    const friendships = await getFriendshipsForUser(userId);
    const incoming = await getPendingRequestsForUser(userId);
    const { friends, outgoing } = splitFriendData(friendships, userId);

    res.render("friends/index", {
        title: "Friends",
        friends,
        outgoing,
        incoming,
        searchResults: [],
        error: null,
        active: "friends"
    });
});

// POST /friends/search
router.post("/search", async (req, res) => {
    const userId = req.session.user.user_id;
    const { term } = req.body;

    const friendships = await getFriendshipsForUser(userId);
    const incoming = await getPendingRequestsForUser(userId);
    const { friends, outgoing } = splitFriendData(friendships, userId);

    const searchResults = term
        ? await searchUsersByUsernamePartial(term, userId)
        : [];

    res.render("friends/index", {
        title: "Friends",
        friends,
        outgoing,
        incoming,
        searchResults,
        error: null,
        active: "friends"
    });
});

// POST /friends/request  (send friend request)
router.post("/request", async (req, res) => {
    const userId = req.session.user.user_id;
    const { addressee_id } = req.body;

    try {
        await sendFriendRequest(userId, addressee_id);
        return res.redirect("/friends");
    } catch (err) {
        console.error("Friend request error:", err.message);

        const friendships = await getFriendshipsForUser(userId);
        const incoming = await getPendingRequestsForUser(userId);
        const { friends, outgoing } = splitFriendData(friendships, userId);

        return res.render("friends/index", {
            title: "Friends",
            friends,
            outgoing,
            incoming,
            searchResults: [],
            error: err.message || "Could not send friend request.",
            active: "friends"
        });
    }
});

// POST /friends/respond  (accept / reject)
router.post("/respond", async (req, res) => {
    const { friendship_id, action } = req.body;
    const status = action === "accept" ? "accepted" : "rejected";

    await updateFriendshipStatus(friendship_id, status);
    return res.redirect("/friends");
});

// POST /friends/cancel  (cancel outgoing pending request)
router.post("/cancel", async (req, res) => {
    const userId = req.session.user.user_id;
    const { friendship_id } = req.body;

    await cancelFriendRequest(friendship_id, userId);
    return res.redirect("/friends");
});

// POST /friends/remove  (unfriend)
router.post("/remove", async (req, res) => {
    const userId = req.session.user.user_id;
    const { friendship_id } = req.body;

    await removeFriend(friendship_id, userId);
    return res.redirect("/friends");
});

module.exports = router;
