const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const userAuth = require("../middleware/userAuth");

const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");

const USER_REQUIRED_DATA = [
  "firstName",
  "lastName",
  "photoURL",
  "age",
  "gender",
  "about",
  "skills",
];

// /user/signup
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      photoURL,
      about,
      skills,
    } = req.body;

    // Check if the password is strong or not
    const isStrongPassword = validator.isStrongPassword(password);

    if (!isStrongPassword) {
      throw new Error("Enter a strong password");
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
      photoURL,
      about,
      skills,
    });

    const userData = await user.save();

    const token = await userData.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    }); // 8 days

    res.json({ message: "Account created successfully", data: userData });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// /user/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      }); // 8 days

      res.json({ message: "Login successful", data: user });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.json({ message: "Logout successful" });
});

router.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      receiverId: loggedInUser._id,
      status: "interested",
    }).populate("senderId", USER_REQUIRED_DATA);

    res.status(200).json({ data: connectionRequests });
  } catch (err) {
    throw new Error(err.message);
  }
});

router.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
    })
      .populate("senderId", USER_REQUIRED_DATA)
      .populate("receiverId", USER_REQUIRED_DATA);

    const data = connectionRequests.map((document) => {
      // using .equals because comparing two mongodb user id
      if (document.senderId._id.equals(loggedInUser._id)) {
        return document.receiverId;
      }
      return document.senderId;
    });

    res.status(200).json({ data });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
    });

    // // Filtering ids which are already in connection (all status)
    // const hideUsersIdFromFeed = connectionRequests.map((connection) => {
    //   if (connection.senderId.equals(loggedInUser._id)) {
    //     return connection.receiverId;
    //   }
    //   return connection.senderId;
    // });

    // const users = await User.find({
    //   $and: [
    //     { _id: { $ne: loggedInUser._id } }, // feed should not contain himself
    //     { _id: { $nin: hideUsersIdFromFeed } },
    //   ],
    // })
    //   .select(USER_REQUIRED_DATA)
    //   .skip(skip)
    //   .limit(limit);

    // contains Unique values only
    const hideUsersIdFromFeed = new Set();

    // this will add all user with a connection status with the user and himself too
    connectionRequests.forEach((connection) => {
      hideUsersIdFromFeed.add(connection.senderId.toString());
      hideUsersIdFromFeed.add(connection.receiverId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $ne: loggedInUser._id } }, // feed should not contain himself
        { _id: { $nin: Array.from(hideUsersIdFromFeed) } }, // Array.from -> Set {'xyz', 'abc'} => ['xyz', 'abc']
      ],
    })
      .select(USER_REQUIRED_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).send({ data: users });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
