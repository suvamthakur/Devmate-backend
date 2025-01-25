const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const profileEditValidation = require("../utils/profileEditValidation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/User");

// /profle/details
router.get("/details", userAuth, async (req, res) => {
  const user = req.user; // userAuth
  res.json({ data: user });
});

router.patch("/edit", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const newData = req.body;

    const isEditAllowed = profileEditValidation(newData);
    if (!isEditAllowed) {
      throw new Error("Edit not allowed");
    }

    const user = await User.findByIdAndUpdate(loggedInUser._id, newData, {
      returnDocument: "after",
      runValidators: true,
    });

    res.json({ message: "Updated successful", data: user });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.patch("/password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not found");
    }

    const isStrongPassword = validator.isStrongPassword(password);
    if (!isStrongPassword) throw new Error("Enter a strong password");

    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashPassword });
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
