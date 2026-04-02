const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/forms/contact
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill name, email and message' });
        }

        // Configure transporter (using Gmail as default)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'surezmec@gmail.com',
                pass: process.env.EMAIL_PASS // User needs to set this in .env
            }
        });

        // Email to the Business
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER || 'surezmec@gmail.com',
            subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject || 'N/A'}

Message:
${message}
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router;
