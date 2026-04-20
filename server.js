require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// ✅ Mongo connect (Optimized for Vercel/Serverless)
let cachedConnection = null;
mongoose.set('bufferCommands', false); // Disable buffering globally

const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in environment variables!');
        throw new Error('MONGO_URI is missing');
    }

    try {
        console.log('Connecting to MongoDB...');
        cachedConnection = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected ✅');
        return cachedConnection;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Middleware to ensure DB connection (Must be before routes!)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error.message,
            tip: 'Check if MONGO_URI is set in Vercel dashboard and IP is whitelisted in Atlas.'
        });
    }
});

app.get('/', (req, res) => {
    res.send('GS Sports Agencies Backend is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));

// Local Development Server (Only runs locally, Vercel ignores this)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
    });
}

// ✅ IMPORTANT for Vercel
module.exports = app;