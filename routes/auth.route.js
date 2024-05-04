const express = require('express');

const {
    registerUser,
    loginUser,
    loginAdmin,
    handleRefreshToken,
    logout,
    updateUser,
    saveAddress,
    getAllUser,
    getAUser,
    deleteAUser,
    blockUser,
    unblockUser,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
} = require('../controllers/user.controller.js');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// user route
router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/password', authMiddleware, updatePassword);

router.get('/logout', logout);

router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);

// refresh token
router.get('/refresh', handleRefreshToken);

router.get('/all-users', getAllUser);
router.get('/:id', authMiddleware, getAUser).put('/:id', authMiddleware, updateUser);
router.get('/wishlist', authMiddleware, getWishlist);

router.put('/save-address', authMiddleware, saveAddress);

// admin
router.post('/admin-login', loginAdmin);

router.delete('/:id', authMiddleware, isAdmin, deleteAUser);

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);

// cart
router.post('/cart', authMiddleware, userCart);
router.post('/cart/apply-coupon', authMiddleware, applyCoupon);
router.get('/cart', authMiddleware, getUserCart);
router.delete('/empty-cart', authMiddleware, emptyCart);

module.exports = router;
