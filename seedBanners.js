require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./models/Banner');

const bannersToSeed = [
    {
        title: "Into the Wild",
        subtitle: "Apparel, Accessories and Footwear",
        image: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=1600&h=600&fit=crop",
        type: "promo_wide",
        link: "/products",
        ctaText: "Shop Now"
    },
    {
        title: "Own Every Step",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=500&fit=crop",
        type: "promo_grid",
        pricePrefix: "999",
        link: "/products"
    },
    {
        title: "Trail Ready Bikes",
        image: "https://images.unsplash.com/photo-1544117518-30103730761e?w=400&h=500&fit=crop",
        type: "promo_grid",
        pricePrefix: "6499",
        link: "/products"
    },
    {
        title: "Glide With Confidence",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
        type: "promo_grid",
        pricePrefix: "1099",
        link: "/products"
    },
    {
        title: "Practice Makes Points",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=500&fit=crop",
        type: "promo_grid",
        pricePrefix: "699",
        link: "/products"
    },
    {
        title: "Flat 30% OFF on All Cricket Gear",
        description: "Upgrade your game with pro-level equipment.",
        image: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&h=600&fit=crop",
        type: "promo_offer",
        code: "CRICKET30",
        ctaText: "Grab the Deal",
        link: "/products?category=Cricket"
    }
];

async function seed() {
    try {
        console.log('Seeding banners...');
        for (const b of bannersToSeed) {
            const exists = await Banner.findOne({ title: b.title, type: b.type });
            if (!exists) {
                await Banner.create(b);
                console.log(`Created banner: ${b.title}`);
            } else {
                console.log(`Banner already exists: ${b.title}`);
            }
        }
        console.log('Finished seeding banners.');
    } catch (e) {
        console.error('Error seeding banners:', e);
    }
}

seed();
