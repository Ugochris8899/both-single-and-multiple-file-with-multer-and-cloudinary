const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    public_id: [{
        type: String
    }]
}, {timestamps: true});


const productModel = mongoose.model('single-multipleMulter/cloud', productSchema)

module.exports = productModel