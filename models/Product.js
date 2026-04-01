const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String },
    categories: [{ type: String }],
    rating: { type: Number, default: 0 },
    description: { type: String },
    inStock: { type: Boolean, default: true }
}, { timestamps: true });

ProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Product', ProductSchema);
