const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// Get all categories (Public)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        console.error('Category Fetch Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Create category (Admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        let imageUrl = '';

        if (req.file) {
            imageUrl = req.file.path;
        } else if (req.body.image && String(req.body.image).startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
            imageUrl = uploadRes.secure_url;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        } else {
            return res.status(400).json({ message: 'Image is required' });
        }

        const category = new Category({ name, image: imageUrl });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update category (Admin)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            category.name = req.body.name || category.name;

            if (req.file) {
                category.image = req.file.path;
            } else if (req.body.image && String(req.body.image).startsWith('data:image')) {
                const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
                category.image = uploadRes.secure_url;
            } else if (req.body.image) {
                category.image = req.body.image;
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete category (Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
