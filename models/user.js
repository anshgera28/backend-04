const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: Number
});

module.exports = mongoose.model("User", UserSchema);