// create user schema
// turn it into a user model
// export the user model so we can use it somewhere else

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true, // `email` must be unique
  },
  firstName: String,
  lastName: String,
  password: String,
  registeredClasses: Array,
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
