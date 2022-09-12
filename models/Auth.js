// create user schema
// turn it into a user model
// export the user model so we can use it somewhere else

const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  token: String,
  userId: String,
  expiry: Number,
});

module.exports = mongoose.model("Auth", authSchema);
