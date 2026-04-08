const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth Middleware
const authUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Auth failed' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// POST /api/user/google-login
router.post('/google-login', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub: googleId, name: displayName, email, picture: profilePicture } = ticket.getPayload();

        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, displayName, email, profilePicture });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, user });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google login failed' });
    }
});

// GET /api/user/cart
router.get('/cart', authUser, async (req, res) => {
    res.json(req.user.cart);
});

// POST /api/user/cart
router.post('/cart', authUser, async (req, res) => {
    try {
        req.user.cart = req.body;
        await req.user.save();
        res.json(req.user.cart);
    } catch (e) {
        res.status(400).json({ message: 'Sync failed' });
    }
});

// PUT /api/user/profile
router.put('/profile', authUser, async (req, res) => {
    try {
        const { displayName, phone, address } = req.body;
        if (displayName) req.user.displayName = displayName;
        if (phone) req.user.phone = phone;
        if (address) req.user.address = address;

        await req.user.save();
        res.json(req.user);
    } catch (e) {
        console.error("Profile update error:", e);
        res.status(400).json({ message: 'Update failed' });
    }
});

module.exports = router;
