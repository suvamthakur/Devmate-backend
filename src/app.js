const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // parse JSON
app.use(cookieParser()); //  parse Cookie

app.use("/user", require("./routes/user"));
app.use("/profile", require("./routes/profile"));
app.use("/request", require("./routes/connectionRequest"));

connectDB()
  .then(() => {
    console.log("DB connection established");
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch(() => {
    console.log("Database cannot be connected");
  });

// update user (put vs patch)
// * In mongodb PUT and PATCH behaves same (partial update) for find..And...
// app.patch("/user/:userId", async (req, res) => {
//   const data = req.body;
//   const _id = req.params?.userId;

//   try {
//     // Only this fields can be updated
//     updateValidation(data);

//     const user = await User.findByIdAndUpdate(_id, data, {
//       runValidators: true,
//     });

//     res.send("user updated");
//     console.log(user);
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// delete
// app.delete("/user", async (req, res) => {
//   const filter = req.body;

//   try {
//     const result = await User.deleteOne(filter);
//     res.send("User deleted");
//     console.log(result);
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// get users
// app.get("/user", async (req, res) => {
//   const filter = req.body;

//   try {
//     const user = await User.find(filter); // returns array of users
//     res.send(user);
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });
