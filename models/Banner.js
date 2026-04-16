const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    type: { type: String, enum: ['slider', 'promo_wide', 'promo_grid', 'promo_offer'], default: 'slider' },
    link: { type: String, default: '/products' },
    ctaText: { type: String },
    pricePrefix: { type: String },
    description: { type: String },
    code: { type: String }
}, { timestamps: true });

BannerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Banner', BannerSchema);
