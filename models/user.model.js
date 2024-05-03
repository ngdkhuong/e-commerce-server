const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate(value) {
                if (!this.validate.isEmail(value)) {
                    throw new Error('Not valid email address');
                }
            },
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user',
        },
        isBlocked: {
            type: String,
            default: false,
        },
        cart: {
            type: Array,
            default: [],
        },
        address: {
            type: String,
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        refreshToken: {
            type: String,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
    },
);

// hash password before uploading to mongodb
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    user.password = bcrypt.hash(user.password, 10);
    next();
});

// check match password
userSchema.methods.isMatchedPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// reset password tokens
userSchema.methods.createPasswordRestToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
