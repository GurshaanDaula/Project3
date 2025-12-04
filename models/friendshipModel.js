// models/friendshipModel.js
const pool = require("../config/db");

// Check if any relationship already exists between two users (either direction)
async function friendshipExists(a, b) {
    const [rows] = await pool.query(
        `SELECT * FROM friendships
         WHERE (requester_id = ? AND addressee_id = ?)
            OR (requester_id = ? AND addressee_id = ?)`,
        [a, b, b, a]
    );
    return rows[0] || null;
}

// Create a new friend request (a -> b) if none exists
async function sendFriendRequest(requester_id, addressee_id) {
    if (requester_id === Number(addressee_id)) {
        throw new Error("You cannot add yourself as a friend.");
    }

    const existing = await friendshipExists(requester_id, addressee_id);
    if (existing) {
        if (existing.status === "pending") {
            throw new Error("A friend request already exists.");
        }
        if (existing.status === "accepted") {
            throw new Error("You are already friends.");
        }
        // For rejected/other statuses, you could allow re-sending,
        // but we'll keep it simple and block duplicates:
        throw new Error("A friendship record already exists.");
    }

    const [result] = await pool.query(
        "INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, 'pending')",
        [requester_id, addressee_id]
    );
    return result.insertId;
}

// Get ALL friendships involving the user (both directions)
async function getFriendshipsForUser(user_id) {
    const [rows] = await pool.query(
        `SELECT 
            f.friendship_id,
            f.requester_id,
            f.addressee_id,
            f.status,
            f.created_at,
            f.responded_at,
            r.username AS requester_name,
            a.username AS addressee_name
         FROM friendships f
         JOIN users r ON f.requester_id = r.user_id
         JOIN users a ON f.addressee_id = a.user_id
         WHERE f.requester_id = ? OR f.addressee_id = ?
         ORDER BY f.created_at DESC`,
        [user_id, user_id]
    );
    return rows;
}

// Get only pending requests *to* the user
async function getPendingRequestsForUser(user_id) {
    const [rows] = await pool.query(
        `SELECT 
            f.friendship_id,
            f.requester_id,
            f.addressee_id,
            f.status,
            f.created_at,
            r.username AS requester_name
         FROM friendships f
         JOIN users r ON f.requester_id = r.user_id
         WHERE f.addressee_id = ? AND f.status = 'pending'
         ORDER BY f.created_at DESC`,
        [user_id]
    );
    return rows;
}

// Accept / reject a friendship
async function updateFriendshipStatus(friendship_id, status) {
    const [result] = await pool.query(
        `UPDATE friendships 
         SET status = ?, responded_at = NOW()
         WHERE friendship_id = ?`,
        [status, friendship_id]
    );
    return result.affectedRows;
}

// Cancel an outgoing pending request you sent
async function cancelFriendRequest(friendship_id, user_id) {
    const [result] = await pool.query(
        `DELETE FROM friendships 
         WHERE friendship_id = ? 
           AND requester_id = ? 
           AND status = 'pending'`,
        [friendship_id, user_id]
    );
    return result.affectedRows;
}

// Remove an accepted friend (unfriend)
async function removeFriend(friendship_id, user_id) {
    const [result] = await pool.query(
        `DELETE FROM friendships 
         WHERE friendship_id = ?
           AND status = 'accepted'
           AND (requester_id = ? OR addressee_id = ?)`,
        [friendship_id, user_id, user_id]
    );
    return result.affectedRows;
}

module.exports = {
    friendshipExists,
    sendFriendRequest,
    getFriendshipsForUser,
    getPendingRequestsForUser,
    updateFriendshipStatus,
    cancelFriendRequest,
    removeFriend
};
