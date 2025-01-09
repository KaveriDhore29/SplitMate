const express = require('express');
const { uploadProfilePicture } = require('../controllers/userController');

const router = express.Router();

// POST route to upload profile picture
router.post('/uploadProfilePicture', uploadProfilePicture);

module.exports = router;
