const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            count: Number,
            color: String,
            size: String,
        },
    ],
});
