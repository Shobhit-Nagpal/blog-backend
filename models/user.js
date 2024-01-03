const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    familyName: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model("User", UserSchema);
