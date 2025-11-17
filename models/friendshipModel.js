const pool = require("../config/db");

async function sendFriendRequest(requester_id, addressee_id) {
    const [result] = await pool.query(
        "INSERT INTO friendships (requester_id, addressee_id) VALUES (?,?)",
        [requester_id, addressee_id]
    );
    return result.insertId;
}

async function getFriendshipsForUser(user_id) {
    const [rows] = await pool.query(
        `
    SELECT f.friendship_id, f.requester_id, f.addressee_id, f.status,
           u1.username AS requester_name, u2.username AS addressee_name
    FROM friendships f
    JOIN users u1 ON f.requester_id = u1.user_id
    JOIN users u2 ON f.addressee_id = u2.user_id
    WHERE f.requester_id = ? OR f.addressee_id = ?
    `,
        [user_id, user_id]
    );
    return rows;
}

async function getPendingRequestsForUser(user_id) {
    const [rows] = await pool.query(
        `
    SELECT f.friendship_id, f.requester_id, u.username AS requester_name
    FROM friendships f
    JOIN users u ON f.requester_id = u.user_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
    `,
        [user_id]
    );
    return rows;
}

async function updateFriendshipStatus(friendship_id, status) {
    await pool.query(
        "UPDATE friendships SET status = ?, responded_at = NOW() WHERE friendship_id = ?",
        [status, friendship_id]
    );
}

async function getFriendsList(user_id) {
    const [rows] = await pool.query(
        `
    SELECT DISTINCT
      CASE
        WHEN requester_id = ? THEN addressee_id
        ELSE requester_id
      END AS friend_id
    FROM friendships
    WHERE (requester_id = ? OR addressee_id = ?)
      AND status = 'accepted'
    `,
        [user_id, user_id, user_id]
    );
    return rows.map(r => r.friend_id);
}

module.exports = {
    sendFriendRequest,
    getFriendshipsForUser,
    getPendingRequestsForUser,
    updateFriendshipStatus,
    getFriendsList
};
