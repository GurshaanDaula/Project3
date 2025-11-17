const pool = require("../config/db");

async function createEvent(owner_id, { title, description, start_time, end_time, color_hex }) {
    const [result] = await pool.query(
        `INSERT INTO events (owner_id, title, description, start_time, end_time, color_hex)
     VALUES (?,?,?,?,?,?)`,
        [owner_id, title, description, start_time, end_time, color_hex]
    );
    return result.insertId;
}

async function updateEvent(event_id, owner_id, fields) {
    const { title, description, start_time, end_time, color_hex } = fields;
    await pool.query(
        `UPDATE events
     SET title = ?, description = ?, start_time = ?, end_time = ?, color_hex = ?
     WHERE event_id = ? AND owner_id = ?`,
        [title, description, start_time, end_time, color_hex, event_id, owner_id]
    );
}

async function softDeleteEvent(event_id, owner_id) {
    await pool.query(
        `UPDATE events SET deleted_at = NOW()
     WHERE event_id = ? AND owner_id = ? AND deleted_at IS NULL`,
        [event_id, owner_id]
    );
}

async function restoreEvent(event_id, owner_id) {
    await pool.query(
        `UPDATE events
     SET deleted_at = NULL
     WHERE event_id = ?
       AND owner_id = ?
       AND deleted_at IS NOT NULL
       AND deleted_at >= NOW() - INTERVAL 30 DAY`,
        [event_id, owner_id]
    );
}

async function hardDeleteOldEvents() {
    await pool.query(
        `DELETE FROM events WHERE deleted_at < NOW() - INTERVAL 30 DAY`
    );
}

async function getEventById(event_id, owner_id) {
    const [rows] = await pool.query(
        "SELECT * FROM events WHERE event_id = ? AND owner_id = ?",
        [event_id, owner_id]
    );
    return rows[0] || null;
}

async function getTodayEvents(owner_id) {
    const [rows] = await pool.query(
        `SELECT * FROM events
     WHERE owner_id = ? AND deleted_at IS NULL
       AND DATE(start_time) = CURDATE()
     ORDER BY start_time ASC`,
        [owner_id]
    );
    return rows;
}

async function getUpcomingEvents(owner_id) {
    const [rows] = await pool.query(
        `SELECT * FROM events
     WHERE owner_id = ? AND deleted_at IS NULL
       AND start_time > NOW()
     ORDER BY start_time ASC`,
        [owner_id]
    );
    return rows;
}

async function getPastEvents(owner_id) {
    const [rows] = await pool.query(
        `SELECT * FROM events
     WHERE owner_id = ? AND deleted_at IS NULL
       AND end_time < NOW()
     ORDER BY start_time DESC`,
        [owner_id]
    );
    return rows;
}

async function getDeletedEvents(owner_id) {
    const [rows] = await pool.query(
        `SELECT * FROM events
     WHERE owner_id = ? AND deleted_at IS NOT NULL
     ORDER BY deleted_at DESC`,
        [owner_id]
    );
    return rows;
}

async function getEventsInRange(owner_id, from, to) {
    const [rows] = await pool.query(
        `SELECT * FROM events
     WHERE owner_id = ?
       AND deleted_at IS NULL
       AND start_time BETWEEN ? AND ?
     ORDER BY start_time ASC`,
        [owner_id, from, to]
    );
    return rows;
}

module.exports = {
    createEvent,
    updateEvent,
    softDeleteEvent,
    restoreEvent,
    hardDeleteOldEvents,
    getEventById,
    getTodayEvents,
    getUpcomingEvents,
    getPastEvents,
    getDeletedEvents,
    getEventsInRange
};
