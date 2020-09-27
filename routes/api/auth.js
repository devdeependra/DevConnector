const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route  GET api/auth
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

// @route  POST api/auth
// @desc   User Login
// @access Public
router.post('/', 
    [
        check('email','Invalid Email').isEmail(),
        check('password','Password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        //console.log(req.body);

        const { email, password } = req.body;
        try {
            //Check if user exist
            let user = await User.findOne({ email });
            if(!user){
                return res.status('400').json({ errors: [{ msg: 'Incalid Credentials' }] });
            }
            
            //Encrypt password
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(isMatch);
            if(!isMatch){
                return res.status('400').json({ errors: [{ msg: 'Incalid Credentials' }] });
            }
            //return jsonwebtoken:used to instant login
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 360000},//ideal could be 10min to 1 hour
                (err, token) =>{
                    if(err) throw err;
                    res.json({ token });
                }
            );
            //res.send('User Registered');
        } catch(err) {
            console.error(err.message);
            res.status('500').send('Server error');
        }

    }
);

module.exports = router;