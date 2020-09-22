const express = require('express');

const router = express.Router();

// @route  GET api/users
// @desc   Test Profile
// @access Public
router.get('/', (req, res) => res.send('Profile Route'));

module.exports = router;