const db = require('../db/db.js');

const UserModel = {
    // Insert a new user
    createUser: async (username, password) => {
        try {
            const [result] = await db.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, password]
            );
            return { id: result.insertId, username };
        } catch (err) {
            throw err;
        }
    },

    getUserByUsername: async (username) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    createSession: async (userId, sessionToken, expiresAt) => {
        try {
            const [result] = await db.execute(
                'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
                [userId, sessionToken, expiresAt]
            );
            return result.insertId;
        } catch (err) {
            throw err;
        }
    },

    validateSessionToken: async (sessionToken) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM sessions WHERE session_token = ? AND expires_at > NOW()',
                [sessionToken]
            );
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    deleteSession: async (sessionToken) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM sessions WHERE session_token = ?',
                [sessionToken]
            );
            return result.affectedRows; // Returns number of deleted rows
        } catch (err) {
            throw err;
        }
    },

};

module.exports = UserModel;
