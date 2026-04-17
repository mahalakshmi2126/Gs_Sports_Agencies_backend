const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// Get all banners (Public)
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({});
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Create banner (Admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle } = req.body;
        let imageUrl = '';

        if (req.file) {
            imageUrl = req.file.path;
        } else if (req.body.image && req.body.image.startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
            imageUrl = uploadRes.secure_url;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        } else {
            return res.status(400).json({ message: 'Image is required' });
        }

        const banner = new Banner({ title, subtitle, image: imageUrl });
        const createdBanner = await banner.save();
        res.status(201).json(createdBanner);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update banner (Admin)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            banner.title = req.body.title || banner.title;
            banner.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : banner.subtitle;

            if (req.file) {
                banner.image = req.file.path;
            } else if (req.body.image && req.body.image.startsWith('data:image')) {
                const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
                banner.image = uploadRes.secure_url;
            } else if (req.body.image) {
                banner.image = req.body.image;
            }

            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete banner (Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            await banner.deleteOne();
            res.json({ message: 'Banner removed' });
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
