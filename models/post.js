const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now},
    updatedAt: {type: Date, required: true, default: Date.now},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    coverImg: {type: String},
    published: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model("Post", PostSchema);
