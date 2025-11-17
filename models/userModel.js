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

async function searchUsersByUsernamePartial(term, excludeUserId) {
    const [rows] = await pool.query(
        "SELECT user_id, username FROM users WHERE username LIKE ? AND user_id <> ?",
        [`%${term}%`, excludeUserId]
    );
    return rows;
}

module.exports = {
    findByEmailOrUsername,
    findById,
    createUser,
    searchUsersByUsernamePartial
};
