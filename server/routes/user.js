const express = require('express');
const { getUser } = require('../controllers/user');
const { protect } = require('../middlewars/auth');

const router = express.Router();

router.get('/me', protect, getUser);


module.exports = router;