const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    items: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        image: String,
        category: String,
        rating: Number,
        description: String,
        inStock: Boolean,
        quantity: Number
    }],
    total: { type: Number, required: true },
    customer: {
        name: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    },
    date: { type: String },
    status: { type: String, default: 'Pending' },
    paymentMethod: { type: String, default: 'Cash on Delivery' }
}, { timestamps: true });

OrderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Order', OrderSchema);
