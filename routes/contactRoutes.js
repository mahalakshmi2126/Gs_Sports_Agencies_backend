const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');

// Get contact info (Public)
router.get('/', async (req, res) => {
    try {
        let contactInfo = await Contact.findOne({});
        if (!contactInfo) {
            // Return default if not exists
            contactInfo = {
                address: "123 Sports Avenue, Gudiyattam, Tamil Nadu 632602",
                phone: "+91 98765 43210",
                email: "info@gsagencies.com",
                socialLinks: [
                    { platform: "whatsapp", url: "https://wa.me/919876543210", enabled: true },
                    { platform: "instagram", url: "https://instagram.com", enabled: true },
                    { platform: "facebook", url: "https://facebook.com", enabled: true }
                ]
            };
        }
        res.json(contactInfo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update contact info (Admin)
router.put('/', protect, async (req, res) => {
    try {
        const { address, phone, email, socialLinks } = req.body;
        let contactInfo = await Contact.findOne({});

        if (!contactInfo) {
            contactInfo = new Contact({ address, phone, email, socialLinks });
        } else {
            if (address) contactInfo.address = address;
            if (phone) contactInfo.phone = phone;
            if (email) contactInfo.email = email;
            if (socialLinks) contactInfo.socialLinks = socialLinks;
        }

        const updatedContactInfo = await contactInfo.save();
        res.json(updatedContactInfo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
