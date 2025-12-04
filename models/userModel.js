// models/userModel.js
const pool = require("../config/db");

async function findByEmailOrUsername(identifier) {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? OR username = ?",
        [identifier, identifier]
    );
    return rows[0] || null;
}

async function findById(user_id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
        user_id
    ]);
    return rows[0] || null;
}

async function createUser(email, username, password_hash) {
    const [result] = await pool.query(
        "INSERT INTO users (email, username, password_hash) VALUES (?,?,?)",
        [email, username, password_hash]
    );
    return result.insertId;
}

// UPDATED: exclude self and existing friendships
async function searchUsersByUsernamePartial(term, currentUserId) {
    const likeTerm = `%${term}%`;

    const [rows] = await pool.query(
        `SELECT u.user_id, u.username, u.email
         FROM users u
         WHERE u.username LIKE ?
           AND u.user_id <> ?
           AND u.user_id NOT IN (
                SELECT addressee_id
                FROM friendships
                WHERE requester_id = ?
             UNION
                SELECT requester_id
                FROM friendships
                WHERE addressee_id = ?
           )
         ORDER BY u.username ASC`,
        [likeTerm, currentUserId, currentUserId, currentUserId]
    );

    return rows;
}

module.exports = {
    findByEmailOrUsername,
    findById,
    createUser,
    searchUsersByUsernamePartial
};
