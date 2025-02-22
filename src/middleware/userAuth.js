const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const data = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = userAuth;
