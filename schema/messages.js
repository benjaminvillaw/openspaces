const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    message: String,
    lat: String,
    lng: String,
});

module.exports = mongoose.model("messages", messagesSchema);