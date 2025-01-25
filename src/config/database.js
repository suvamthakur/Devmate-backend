const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://suvamthakur:suvamatlas@cluster0.cwfhadh.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
