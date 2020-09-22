const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route  POST api/users
// @desc   Registration Route
// @access Public
router.post('/', 
    [
        check('name','Name is required').not().isEmpty(),
        check('email','Please enter a valid email addresss').isEmail(),
        check('password','Please enter a password with 6 or more charaters').isLength({ min: 6 })
    ], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        console.log(req.body);

        const { name, email, password } = req.body;
        try {
            //Check if user exist
            let user = await User.findOne({ email });
            if(user){
                return res.status('400').json({ errors: [{ msg: 'User already exists' }] });
            }
            
            // Get gravatar
            const avatar = gravatar.url( email,{
                s:'200', //Size
                r: 'pg', //Some sober image
                d: 'mm'  //display default image if unavailable
            });
            //Create instance for user
            user = new User({
                name,
                email,
                password,
                avatar
            });
            //console.log(user);process.exit(1);
            
            //Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            console.log("Git hereeee");
            //console.log(user);process.exit(1);
            //save user
            await user.save();
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
});

module.exports = router;