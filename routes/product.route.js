const express = require('express');

const {
    createProduct,
    updateProduct,
    getProduct,
    getAllProduct,
    deleteProduct,
} = require('../controllers/product.controller');

const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);

router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

router.get('/:id', getProduct);

router.get('/', getAllProduct);

module.exports = router;
