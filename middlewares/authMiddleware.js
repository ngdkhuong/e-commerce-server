const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error('Not Authorized, Please Login Again');
        }
    } else {
        throw new Error('There is no token attached to the header... ');
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const admin = await User.findOne({ email });

    if (admin.role !== 'admin') {
        throw new Error('You are not an admin');
    } else {
        next();
    }
});

module.exports = {
    authMiddleware,
    isAdmin,
};
