const express = require('express');

const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
// @route  GET api/users
// @desc   Test Auth
// @access Public
router.get('/', 
    auth, 
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
            //res.send('Auth Route');
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }

    }
);

module.exports = router;