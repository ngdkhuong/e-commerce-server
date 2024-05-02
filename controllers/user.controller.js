const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Schema
const User = require('../models/user.model');
const uploadCloudinary = require('../utils/uploadCloudinary');

const registerUser = async (req, res, next) => {
    try {
        //Received Data From Front-End
        const { name, email, password } = req.body;

        // Name validation
        if (!name) return res.status(400).send('Name is required');

        // Password validation
        if (!password || password.length < 6) {
            return res.status(400).send('Password is required and should be min 6 characters long');
        }

        // Email validation
        let userExist = await User.findOne({ email }).exec();
        if (userExist) return res.status(400).send('Email is taken');

        // hash password
        const hashedPassword = await hashPassword(password);

        // Save user in database
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });
        await user.save();

        //Send success response to front-end
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(400).send('Error. Try again.');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (user && user._id) {
            if (user.role !== 'user') {
                res.status(500).json({
                    message: 'There was an error!!',
                });
            }

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);

            if (isValidPassword) {
                // user object
                const userInfo = { ...user._doc };
                delete userInfo.password;

                // generate token
                const token = jwt.sign(userInfo, process.env.JWT_SECRET, {
                    expiresIn: '7d',
                });

                res.status(200).json({
                    message: 'Login Successfully',
                    data: {
                        user: userInfo,
                        accessToken: token,
                    },
                });
            } else {
                res.status(500).json({
                    message: 'Something went wrong',
                });
            }
        } else {
            res.status(500).json({
                message: 'Something went wrong',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getUser = async (req, res) => {
    try {
        if (req.userId && req.email) {
            res.status(200).json({
                message: 'User is Login',
                status: 200,
            });
        } else {
            res.status(500).json({
                message: 'User is not Login!',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
};
