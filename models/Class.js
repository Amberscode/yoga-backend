const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  type: String,
  date: Date,
  time: String,
  teacher: String,
  capacity: Number,
  duration: Number,
  registeredUsers: Array,
  isCanceled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Class", classSchema);
