const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('All fields are required');
        }

        const existingUser = await UserModel.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).send('User with this username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UserModel.createUser(username, hashedPassword);

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        const user = await UserModel.getUserByUsername(username);
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password');
        }

        const sessionToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await UserModel.createSession(user.id, sessionToken, expiresAt);

        res.status(200).json({ message: 'Login successful', sessionToken });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { sessionToken } = req.body;

        if (!sessionToken) {
            return res.status(400).send('Session token is required');
        }
        const deletedRows = await UserModel.deleteSession(sessionToken);
        if (deletedRows === 0) {
            return res.status(404).send('Session not found');
        }

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).send('Internal Server Error');
    }
});

const authenticate = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.split(' ')[1];
        if (!sessionToken) {
            return res.status(401).send('Authentication token is required');
        }
        
        const session = await UserModel.validateSessionToken(sessionToken);
        if (!session) {
            return res.status(401).send('Invalid or expired session token');
        }

        req.userId = session.user_id;
        next();
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    router,
    authenticate,
};
