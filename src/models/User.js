const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    password: {
      type: String,
      required: true,
      // validation is checked in API level
    },

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
    },

    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value.toLowerCase())) {
          throw new Error("Enter a valid gender type");
        }
      },
    },

    photoURL: {
      type: String,
      default:
        "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo url");
        }
      },
    },

    about: {
      type: String,
      maxLength: [200, "About section can contain maximum 200 characters"],
    },

    skills: {
      type: [String],
      validate(value) {
        if (value.length > 15) {
          throw new Error("Skills can't be more than 15");
        }
      },
    },
  },
  { timestamps: true }
);

// JWT sign
userSchema.methods.getJWT = async function () {
  // this refers to the intance (document) of this model
  const token = await jwt.sign({ _id: this._id }, "secretKey@devTinder", {
    expiresIn: "7d",
  });

  return token;
};

// Password validation
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    this.password
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
