const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/ConnectionRequest");
const userAuth = require("../middleware/userAuth");
const User = require("../models/User");

router.post("/send/:status/:userId", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const status = req.params.status;

    // Check status
    const ALLOWED_STATUS = ["interested", "ignored"];
    if (!ALLOWED_STATUS.includes(status)) {
      throw new Error("Invalid status type");
    }

    // Check receiverId
    const user = await User.findById(receiverId);
    if (!user) {
      throw new Error("Invalid request");
    }

    // Check if the connection has already been made
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingConnectionRequest) {
      throw new Error("Connection request already exists");
    }

    const connectionRequest = new ConnectionRequest({
      senderId,
      receiverId,
      status,
    });
    const data = await connectionRequest.save();

    res.json({ message: "suceessful", data });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const ALLOWED_STATUS = ["accepted", "rejected"];
    const status = req.params.status;
    const loggedInUser = req.user;

    if (!ALLOWED_STATUS.includes(status)) {
      throw new Error("Invalid status type");
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: req.params.requestId,
      status: "interested",
      receiverId: loggedInUser,
    });

    if (!connectionRequest) {
      throw new Error("Invalid request");
    }
    connectionRequest.status = status;
    await connectionRequest.save();

    res.status(200).send("Connection request is made successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
