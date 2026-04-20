require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));

app.get('/', (req, res) => {
    res.send('GS Sports Agencies Backend is running...');
});

// ✅ Mongo connect (Optimized for Vercel/Serverless)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        console.log('Connecting to MongoDB...');
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('MongoDB connected ✅');

        // Only seed if we actually just connected
        const Category = require('./models/Category');
        const catCount = await Category.countDocuments();
        if (catCount === 0) {
            const runSeed = require('./seed');
            await runSeed();
            console.log('Database seeded.');
        }
    } catch (err) {
        console.error('MongoDB error:', err);
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Local Development Server (Only runs locally, Vercel ignores this)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
    });
}

// ✅ IMPORTANT for Vercel
module.exports = app;