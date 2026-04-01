const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    address: String,
    phone: String,
    email: String,
    socialLinks: [{
        platform: { type: String, enum: ['whatsapp', 'facebook', 'instagram'] },
        url: String,
        enabled: { type: Boolean, default: false }
    }]
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
