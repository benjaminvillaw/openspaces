const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    message: String,
    lat: Number,
    lng: Number,
    time: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("messages", messagesSchema);