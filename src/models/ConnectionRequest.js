const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    receiverId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "{VALUE} is inavlid status type",
      }, // Enum used for restriction
    },
  },
  { timestamps: true }
);

// Compound index
connectionRequestSchema.index({ senderId: 1, receiverId: 1 });

// middleware
connectionRequestSchema.pre("save", function (next) {
  if (this.senderId.equals(this.receiverId)) {
    throw new Error("Invalid connection request");
  }
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
