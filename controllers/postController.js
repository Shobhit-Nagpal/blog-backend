const fs = require("fs");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const upload = multer({ dest: "uploads/"});

exports.post_list = asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find({}).populate("author", ["username"]).sort({ createdAt: -1 }).exec();
    res.json(allPosts);
});

exports.post_get = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { token } = req.cookies;

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, info) => {
        const post = await Post.findById(id).exec();
        res.json(post);
    });
});

exports.post_post = [
    upload.single("file"), 
    asyncHandler(async (req, res, next) => {
        const { title, content } = req.body;
        const { token } = req.cookies;

        const { originalname, path } = req.file;
        const fileParts = originalname.split(".");
        const extension = fileParts[fileParts.length - 1];
        const newPath = path + "." + extension;
        fs.renameSync(path, newPath);
        
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, info) => {
            if (err) throw err;

            const newPost = new Post({
                title: title,
                content: content,
                coverImg: newPath,
                author: info.id
            });

            await newPost.save();
            res.json({ message: "Post created!", filePath: req.file});
        });
    })
];

exports.post_put = [
    upload.single("file"),
    asyncHandler(async (req, res, next) => {
    
    let newPath = null;

    const { token } = req.cookies;
    const { id } = req.params;

    const { title, content, published, createdAt, coverImg } = req.body;

    if (req.file) {
        const { originalname, path } = req.file;
        const fileParts = originalname.split(".");
        const extension = fileParts[fileParts.length - 1];
        newPath = path + "." + extension;
        fs.renameSync(path, newPath);
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, info) => {
        if (err) throw err;

        const post = new Post({
            title: title,
            content: content,
            coverImg: newPath ? newPath : coverImg,
            author: info.id,
            _id: id,
            published: published,
            createdAt: createdAt,
            updatedAt: Date.now()
        });

        const updatedPost = await Post.findByIdAndUpdate(id, post, {}).exec();
        res.json({ message: "Post updated!" });
    });
})
];

exports.post_delete = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    const { id } = req.params;

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, info) => {
        const post = await Post.findByIdAndRemove(id).exec();
        res.json({ message: "Post deleted!" });
    });
});
