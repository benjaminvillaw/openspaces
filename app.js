// Using Node.js `require()`
require("dotenv").config({
    path: "./.env.local",
});

// console.log(process.env) // remove this after you've confirmed it working

const mongoose = require("mongoose");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var messageModel = require("./schema/messages");

var app = express();
mongoose
    .connect(process.env.MONGODB_URL)
    .then((response) => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        if (err) console.error(err);
    });
const server = http.createServer(app);

app.use(cors());
app.options("*", cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

const io = new Server(server, {
    cors: {
        origin: "*",
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

async function getAllMessages() {
    const messages = await messageModel.find({}).lean();
    return messages;
}

async function addNewMessage(message) {
    const newMessage = await messageModel.create(message);
    return newMessage;
}

async function addNewReply(messageId, replyMessage) {
    const message = await messageModel.findById(messageId);
    message.replies.push({
        message: replyMessage,
    });
    await message.save();
    return message.replies[message.replies.length - 1];
}

// const messages = [];
io.on("connection", async(socket) => {
    console.log("a user connected");
    socket.emit("initMessages", {
        messages: await getAllMessages(),
    });
    socket.on("newMessage", async(payload) => {
        const newMessage = await addNewMessage(payload.message);
        const outgoingPayload = {
            message: newMessage,
        };
        socket.broadcast.emit("newMessage", outgoingPayload);
        socket.emit("newMessage", outgoingPayload);
    });
    socket.on("newReply", async(payload) => {
        const newReply = await addNewReply(
            payload.activeMessageId,
            payload.message
        );
        const outgoingPayload = {
            reply: newReply,
            messageId: payload.activeMessageId,
        };
        socket.broadcast.emit("newReply", outgoingPayload);
        socket.emit("newReply", outgoingPayload);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port`);
});

module.exports = app;

// const messages = [
//     {
//       lat: 1.00,
//       long: -2.0,
//       messages: [{userId, timestamp, message}]
//     } ,
//     {
//     lat: 2,long: 3, messages: [{userId, timestamp, message}]}
//   ]

//   messages.find(({lat, long}) => {
//       return pinLat === lat && pinLong === long
//   })