const express = require('express');
const {
    registerUser,
    loginUser,
    loginAdmin,
    handleRefreshToken,
    logout,
    updateUser,
    saveAddress,
} = require('../controllers/user.controller.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
