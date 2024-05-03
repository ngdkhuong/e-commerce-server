const User = require('../models/user.model.js');
const Product = require('../models/product.model.js');
const Cart = require('../models/cart.model.js');
const Coupon = require('../models/coupon.model.js');
const Order = require('../models/order.model.js');
const uniqid = require('uniqid');

const asyncHandler = require('express-async-handler');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const validateMongoDbId = require('../utils/validateMongoDbId');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const sendEmail = require('./email.controller.js');

const registerUser = asyncHandler(async (req, res) => {
    //Received Data From Front-End
    const email = req.body.email;

    const findUser = await User.findOne({ email: email });

    if (findUser) {
        res.status(400).send('User Already Exists');
    } else {
        const newUser = await User.create(req.body);
        res.status(201).json({
            message: 'Register successfully',
            newUser,
        });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);

        const updateUser = await User.findByIdUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true },
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
            _id: findUser?._id,
            fullName: findUser?.fullName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

// Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') throw new Error('Not Authorized');
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            { new: true },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            fullName: findAdmin?.fullName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');

    const refreshToken = cookie.refreshToken;

    const user = await User.findOne({ refreshToken });

    if (!user) throw new Error('No Refresh token present in db or not matched');

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token');
        }
        const accessToken = generateToken(user?._id);

        res.status(200).json({ accessToken });
    });
});

// logout
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);
    }

    await User.findOneAndUpdate(refreshToken, {
        refreshToken: '',
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });

    res.sendStatus(204);
});

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                fullName: req?.body?.fullName,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            },
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            },
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find().populate('wishlist');
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single User
const getAUSer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(_id);
    try {
        const user = await User.findById(id);
        res.json({
            user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(_id);

    try {
        const user = await User.findByIdAndDelete(id);
        res.json({
            user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(_id);

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            },
        );
        res.json(user);
    } catch (error) {
        throw new Error({ message: 'User Blocked' });
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            },
        );
        res.json({ message: 'User Unblocked' });
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found with this email');
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            text: 'Hey User',
            subject: 'Forgot Password Link',
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error(' Token Expired, Please try again later');

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const user = await User.findById(_id).populate('wishlist');
        res.status(200).json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        let products = [];
        const user = await User.findById(_id);

        
    } catch (error) {}
});

module.exports = {
    registerUser,
    loginUser,
    loginAdmin,
    handleRefreshToken,
    logout,
    updateUser,
    saveAddress,
    getAllUser,
    deleteAUser,
    blockUser,
    unblockUser,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
};
