const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    address: String,
    phone: String,
    email: String,
    hours: String,
    socialLinks: [{
        platform: { type: String, enum: ['whatsapp', 'facebook', 'instagram'] },
        url: String,
        enabled: { type: Boolean, default: false }
    }],
    isCodEnabled: { type: Boolean, default: true },
    addonShippingFee: { type: Number, default: 49 }
}, { timestamps: true });

ContactSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
