require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Import models for seeding
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Banner = require('./models/Banner');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
    res.send('GS Sports Agencies Backend is running...');
});

// Database connection & Server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected successfully');

        // Auto-seed Admin
        try {
            const adminExists = await Admin.findOne({ username: 'Admin' });
            if (!adminExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('Admin@123', salt);
                await Admin.create({
                    username: 'Admin',
                    password: hashedPassword
                });
                console.log('Default Admin user seeded successfully.');
            }

            // Seed default Categories if empty
            const catCount = await Category.countDocuments();
            if (catCount === 0) {
                const defaultCategories = [
                    { name: "Cricket", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop" },
                    { name: "Football", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop" },
                    { name: "Badminton", image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop" },
                    { name: "Basketball", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop" },
                    { name: "Fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop" },
                    { name: "Indoor Games", image: "https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=400&h=300&fit=crop" },
                    { name: "Volleyball", image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop" },
                    { name: "Add-ons", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" }
                ];
                await Category.insertMany(defaultCategories);
                console.log('Default categories seeded.');
            }

            // Seed default Banners if empty
            const bannerCount = await Banner.countDocuments();
            if (bannerCount === 0) {
                const defaultBanners = [
                    { image: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1400&h=600&fit=crop", title: "Unleash Your Game", subtitle: "Premium sports gear for champions" },
                    { image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1400&h=600&fit=crop", title: "New Season, New Gear", subtitle: "Up to 40% off on selected items" },
                    { image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1400&h=600&fit=crop", title: "Train Like a Pro", subtitle: "Professional equipment at your fingertips" }
                ];
                await Banner.insertMany(defaultBanners);
                console.log('Default banners seeded.');
            }

            // Seed Products if empty
            const prodCount = await Product.countDocuments();
            if (prodCount === 0) {
                const defaultProducts = [
                    { name: "Pro Cricket Bat", price: 2499, image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=400&fit=crop", category: "Cricket", rating: 4.8, description: "Professional-grade English willow cricket bat with premium grip and balanced weight distribution for power hitting.", inStock: true },
                    { name: "Football Elite", price: 1299, image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400&h=400&fit=crop", category: "Football", rating: 4.5, description: "Match-quality FIFA approved football with thermal bonding technology for consistent flight and durability.", inStock: true },
                    { name: "Badminton Racket Pro", price: 1899, image: "https://images.unsplash.com/photo-1617083934551-ac1f1c920aaa?w=400&h=400&fit=crop", category: "Badminton", rating: 4.7, description: "Lightweight carbon fiber racket with high tension string bed for explosive smashes and precise drops.", inStock: true },
                    { name: "Basketball Official", price: 999, image: "https://images.unsplash.com/photo-1494199505258-5f95387f933c?w=400&h=400&fit=crop", category: "Basketball", rating: 4.4, description: "Official size and weight basketball with deep channel design for superior grip and ball handling.", inStock: true },
                    { name: "Gym Dumbbell Set", price: 4999, image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400&h=400&fit=crop", category: "Fitness", rating: 4.9, description: "Premium rubber-coated dumbbell set with ergonomic handles and anti-roll design for safe training.", inStock: true },
                    { name: "Cricket Helmet Guard", price: 1799, image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=400&h=400&fit=crop", category: "Cricket", rating: 4.3, description: "Titanium grille cricket helmet with superior ventilation and impact-resistant shell for maximum protection.", inStock: true },
                    { name: "Running Shoes Pro", price: 3299, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Fitness", rating: 4.7, description: "Lightweight responsive running shoes with energy-return cushioning and breathable mesh upper.", inStock: true },
                    { name: "Volleyball Pro", price: 899, image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop", category: "Volleyball", rating: 4.5, description: "Professional indoor volleyball with soft touch panel and enhanced grip for competitive play.", inStock: true },
                    { name: "Grip Tape Roll", price: 149, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", category: "Add-ons", rating: 4.2, description: "High-quality grip tape for bats, rackets and handles. Provides excellent sweat absorption.", inStock: true },
                    { name: "Sports Water Bottle", price: 299, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop", category: "Add-ons", rating: 4.0, description: "BPA-free sports water bottle with leak-proof design and easy-grip shape.", inStock: true }
                ];
                await Product.insertMany(defaultProducts);
                console.log('Default products seeded.');
            }
        } catch (e) {
            console.error("Error during auto-seeding:", e);
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });