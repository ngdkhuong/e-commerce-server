const express = require('express');
const {
    createCategory,
    getCategory,
    getAllCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);
router.get('/:id', getCategory);
router.get('/', getAllCategory);

module.exports = router;
