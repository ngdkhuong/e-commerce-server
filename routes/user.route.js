const express = require('express');
const { registerUser, loginUser, getUser } = require('../controllers/user.controller');
const upload = require('../middlewares/singleFileUpload');
const checkedLogin = require('../middlewares/checkedLogin');

const router = express.Router();

router.post('/register', upload.single('profilePic'), registerUser);
router.post('/login', loginUser);
router.get('/me', checkedLogin, getUser);

module.exports = router;
