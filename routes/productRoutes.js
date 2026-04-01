const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create product
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, categories, rating, description, inStock } = req.body;
        let imageUrl = '';

        // image from frontend can be a file upload, or a string
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

        const product = new Product({
            name,
            price: Number(price),
            image: imageUrl,
            category,
            categories: categories ? JSON.parse(categories) : [],
            rating: Number(rating) || 0,
            description,
            inStock: inStock === 'true' || inStock === true
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update product
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, categories, rating, description, inStock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price ? Number(price) : product.price;
            product.category = category || product.category;
            if (categories) product.categories = JSON.parse(categories);
            product.rating = rating ? Number(rating) : product.rating;
            product.description = description || product.description;
            if (inStock !== undefined) product.inStock = inStock === 'true' || inStock === true;

            if (req.file) {
                product.image = req.file.path;
            } else if (req.body.image && String(req.body.image).startsWith('data:image')) {
                const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
                product.image = uploadRes.secure_url;
            } else if (req.body.image) {
                product.image = req.body.image;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete product
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
