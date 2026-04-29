const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Create product
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    try {
        const { name, price, category, categories, rating, description, inStock, sizes, colors, stockQuantity } = req.body;
        let imageUrl = '';
        let additionalImages = [];

        // Main image
        if (req.files && req.files.image) {
            imageUrl = req.files.image[0].path;
        } else if (req.body.image && String(req.body.image).startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
            imageUrl = uploadRes.secure_url;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        // Additional images
        if (req.files && req.files.images) {
            additionalImages = req.files.images.map(file => file.path);
        } else if (req.body.images) {
            try {
                additionalImages = JSON.parse(req.body.images);
            } catch (e) {
                additionalImages = [req.body.images];
            }
        }

        // If main image is missing but additional images exist, take the first one
        if (!imageUrl && additionalImages.length > 0) {
            imageUrl = additionalImages[0];
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image is required' });
        }

        let categoriesParsed = [];
        if (categories) {
            try {
                categoriesParsed = JSON.parse(categories);
            } catch (e) {
                categoriesParsed = [categories];
            }
        }

        let sizesParsed = [];
        if (sizes) {
            try {
                sizesParsed = JSON.parse(sizes);
            } catch (e) {
                sizesParsed = [sizes];
            }
        }

        let colorsParsed = [];
        if (colors) {
            try {
                colorsParsed = JSON.parse(colors);
            } catch (e) {
                colorsParsed = [colors];
            }
        }

        const product = new Product({
            name,
            price: Number(price),
            image: imageUrl,
            images: additionalImages.length > 0 ? additionalImages : [imageUrl],
            category,
            categories: categoriesParsed,
            rating: Number(rating) || 0,
            description,
            sizes: sizesParsed,
            colors: colorsParsed,
            stockQuantity: Number(stockQuantity) || 0,
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
router.put('/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    try {
        const { name, price, category, categories, rating, description, inStock, sizes, colors, stockQuantity, existingImages } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price ? Number(price) : product.price;
            product.category = category || product.category;
            if (categories) {
                try {
                    product.categories = JSON.parse(categories);
                } catch (e) {
                    product.categories = [categories];
                }
            }
            product.rating = rating ? Number(rating) : product.rating;
            product.description = description || product.description;

            if (sizes) {
                try {
                    product.sizes = JSON.parse(sizes);
                } catch (e) {
                    product.sizes = [sizes];
                }
            }

            if (colors) {
                try {
                    product.colors = JSON.parse(colors);
                } catch (e) {
                    product.colors = [colors];
                }
            }

            product.stockQuantity = stockQuantity !== undefined ? Number(stockQuantity) : product.stockQuantity;
            if (inStock !== undefined) product.inStock = inStock === 'true' || inStock === true;

            // Handle main image update
            if (req.files && req.files.image) {
                product.image = req.files.image[0].path;
            } else if (req.body.image && String(req.body.image).startsWith('data:image')) {
                const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'gs_sports' });
                product.image = uploadRes.secure_url;
            } else if (req.body.image) {
                product.image = req.body.image;
            }

            // Handle additional images update
            let updatedImages = [];
            if (existingImages) {
                try {
                    updatedImages = JSON.parse(existingImages);
                } catch (e) {
                    updatedImages = [existingImages];
                }
            } else {
                updatedImages = product.images || [];
            }

            if (req.files && req.files.images) {
                const newImageUrls = req.files.images.map(file => file.path);
                updatedImages = [...updatedImages, ...newImageUrls];
            }

            product.images = updatedImages;

            // Ensure main image is also in images array
            if (product.image && !product.images.includes(product.image)) {
                product.images = [product.image, ...product.images];
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("PUT /products/:id Error:", error);
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

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a review
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const review = new Review({
            productId: req.params.id,
            userId: req.user.id,
            userName: req.user.displayName,
            rating: Number(rating),
            comment
        });

        await review.save();

        // Update product rating average
        const reviews = await Review.find({ productId: req.params.id });
        product.rating = Number((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1));
        await product.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
