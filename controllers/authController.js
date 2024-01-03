const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

exports.login_post = [
    body("username", "Username should be a minimum of 4 character").trim().isLength({ min: 4 }).escape(),
    body("password", "Password should be a minimum of 8 characters").trim().isLength({ min: 8 }).escape(),
    asyncHandler( async (req, res, next) => {
        const errors = validationResult(req);

        const { username, password } = req.body;


        const user = await User.findOne({ username: username }).exec();

        if (!user) {
            res.status(400).json({ errors: ["User does not exist"] });
            return;
        }

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        else {

            const passwordMatches = await bcrypt.compare(password, user.password);
            if (passwordMatches) {
                jwt.sign({ username: username, id: user._id, isAdmin: user.isAdmin}, process.env.JWT_SECRET_KEY, {}, function (err, token) {
                    res.cookie("token", token).json({ username: username, id: user._id });;
                });
            }
            else {
                res.status(400).json({ errors: ["Incorrect password"] });
            }
        }
    })
];

exports.logout_post = asyncHandler( async (req, res, next) => {
   res.cookie("token", "").json("Logged out"); 
});

exports.register_post = [
    body("username", "Username should be minimum 4 characters").trim().isLength({ min: 4 }).escape(),
    body("password", "Password should be minimum 4 characters").trim().isLength({ min: 8 }).escape(),
    body("firstname", "First name should not be empty").trim().isLength({ min: 1 }).escape(),
    body("familyname", "Family name should not be empty").trim().isLength({ min: 1 }).escape(),
    body("confirmpassword", "Password does not match").trim().isLength({ min: 8 }).custom((value, { req }) => {
        return value === req.body.password;
    }),
    asyncHandler( async (req ,res, next) => {
        const errors = validationResult(req);

        const userExists = await User.findOne({ username: req.body.username }).exec();
        
        if (userExists) {
            res.status(400).json({errors: ["User already exists"]});
            return;
        }

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
                firstName: req.body.firstname,
                familyName: req.body.familyname,
            });

            await newUser.save();
            res.json({ message: "User created" });
        }
    })
];

exports.admin_post = [
    body("username", "Username should be minimum 4 characters").trim().isLength({ min: 4 }).escape(),
    body("password", "Password should be minimum 4 characters").trim().isLength({ min: 8 }).escape(),
    asyncHandler( async (req, res, next) => {
        const errors = validationResult(req);
        
        const { username, password } = req.body;

        const { token } = req.cookies;

        const userExists = await User.findOne({ username: username }).exec();

        if (!userExists) {
            res.status(400).json({ errors: ["User does not exist"] });
            return;
        }

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, info) {

            if (err) return next(err);
            
            if (String(password) === String(process.env.ADMIN_PASSWORD)) {
                const _user = new User({
                    username: userExists.username,
                    password: userExists.password,
                    _id: userExists._id,
                    isAdmin: true,
                    firstName: userExists.firstName,
                    familyName: userExists.familyName
                });

                const updatedUser = await User.findByIdAndUpdate(userExists._id, _user, {});
                res.json({ message: "Admin created!" });


            }
            else {
                res.status(400).json({ errors: ["Wrong password"] });
            }
        });

    })
];

exports.profile_get = asyncHandler(async (req, res, next) => {
   const { token } = req.cookies

    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, info) {
        if (err) {
            console.log(err);
            res.status(403).json({ message: "Not authorized" });
        }

        res.json(info);
    });

});
