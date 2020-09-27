const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const request = require('express');
const config = require('config');
// @route  GET api/profile/me
// @desc   Get current user profile
// @access Public
router.get(
    '/me', 
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id }).populate('user', 
            ['name', 'avatar']);
            if(!profile){
                return res.status('400').json({ errors: [{ msg: 'Profile does not exists for this user' }] });
            }

            //res.json(user);
            return res.json(profile);
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);

// @route  Post api/profile
// @desc   Create or update profile
// @access Private
router.post(
    '/', 
    [
        auth,
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status('400').json({ errors: errors.array() });
        }
        const {
            handle,
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram
        } = req.body;
        // Get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if (handle) profileFields.handle = handle;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername)
            profileFields.githubusername = githubusername;
        // Skills - Spilt into array
        if (skills) {
            profileFields.skills = skills.split(',');
        }

        // Social
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        
        try {
            let profile = await Profile.findOne({user: req.user.id});
            if(profile) {
                //Update Profile
                console.log("Update");
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }
            //Create a new profile
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);

// @route  GET api/profile/user/:user_id
// @desc   Get profile by User ID
// @access Public
router.get(
    '/user/:user_id', 
    async (req, res) => {
        try {
            //user_id: 5f69e77dfc336d04f7a219eb
            const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', 
            ['name', 'avatar']);
            if(!profile){
                return res.status('400').json({ errors: [{ msg: 'Profile not found' }] });
            }

            //res.json(user);
            return res.json(profile);
        } catch(err) {
            console.error(err.message);
            if(err.kind == 'ObjectId') {
                return res.status('400').json({ errors: [{ msg: 'Profile not found' }] });
            }
            return res.status(500).send("Server error");
        }
    }
);

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get(
    '/', 
    async (req, res) => {
        try {
            const profiles = await Profile.find().populate('user', 
            ['name', 'avatar']);
            if(!profiles){
                return res.status('400').json({ errors: [{ msg: 'Profile does not exists for this user' }] });
            }

            //res.json(user);
            return res.json(profiles);
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);
// @route  DELETE api/profile
// @desc   Delete Logged in user profile
// @access Private
router.delete(
    '/', 
    auth, 
    async (req, res) => {
        try {
            //@TODO - delete user posts
            //Delete profile
            await User.findOneAndRemove({ _id: req.user.id});
            //Delete User
            await Profile.findOneAndRemove({ user: req.user.id});
            
            return res.json({ msg: 'User Profile Deleted' });
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);

// @route  PUT api/profile
// @desc   Add Experience in Profile
// @access Private
router.put(
    '/experience', 
    [
        auth,
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status('400').json({ errors: errors.array() });
        }
        const {
            title, 
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        // Get fields
        const experienceFields = {};
        if (title) experienceFields.title = title;
        if (company) experienceFields.company = company;
        if (location) experienceFields.location = location;
        if (from) experienceFields.from = from;
        if (to) experienceFields.to = to;
        if (current) experienceFields.current = current;
        if (description) experienceFields.description = description;
        
        try {
            const profile = await Profile.findOne({user: req.user.id});
            if(profile) {
                //Update Profile
                console.log("Updating profile");
                profile.experience.unshift(experienceFields);
                await profile.save();
                //console.log("Printing that json");
                return res.json(profile);
            } else {
                console.log("Printing this json");
                return res.json( { "msg": "Profile does not exists for this user" } );    
            }
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);
//5f6dfe8157b8e9046f72a72d
//5f6dff1657b8e9046f72a730
//5f6dfee357b8e9046f72a72f
// @route  DELETE api/profile/experience
// @desc   Delete Logged in user profile experience
// @access Private
router.delete(
    '/experience/:exp_id', 
    auth, 
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id});
            profile.experience.pull({ _id: req.params.exp_id});
            /*
            //Method used in MERN tute
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
            if(removeIndex==-1) {
                return res.json({ msg: "Invalid Exp ID" });
            }
            console.log(removeIndex);
            profile.experience.splice(removeIndex, 1);
            */
            await profile.save();
            return res.json(profile);
        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);

// @route  GET api/profile/github/:user_name
// @desc   Get Github profile by username
// @access Public
router.get(
    '/github/:user_name', 
    (req, res) => {
        try {
            //user_id: 5f69e77dfc336d04f7a219eb
            const options = {
                uri: `https://api.github.com/users/${ req.params.user_name}/repos?per_page=5&sort=created:asc&client_id=${ config.get('githubClientID') }&client_secret=${ config.get('githubSecret') }`,
                method: 'GET',
                headers: { 'user-agent': 'node.js' }
            }
            //console.log(options);
            request(options, (error, response, body) => {
                console.log("Something happned");
                if(error) console.error(error);
                if(response.statusCode !== 200) {
                    res.status(404).json( { msg: "No github profile was found" });
                }
                return res.json(JSON.parse(body))

            });
            return res.json({ msg: "Nothing happend" });

        } catch(err) {
            console.error(err.message);
            return res.status(500).send("Server error");
        }
    }
);
module.exports = router;