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
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));

app.get('/', (req, res) => {
    res.send('GS Sports Agencies Backend is running...');
});

// ✅ Mongo connect (NO listen, NO exit)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected ✅');
        const runSeed = require('./seed');
        runSeed(); // Automatically populates database if empty
    })
    .catch(err => console.error('MongoDB error:', err));

// Local Development Server (Only runs locally, Vercel ignores this)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}

// ✅ IMPORTANT for Vercel
module.exports = app;