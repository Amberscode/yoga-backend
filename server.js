require("dotenv").config();

// import variables
let dbConnectionString = process.env.DB_URL;

// import packages
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 80;

// import models
const User = require("./models/User");
const { response } = require("express");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbConnectionString);
}
// collect all the user information and store it into an object {}
// send it to http://localhost:80/user/create (POST)
// axios (how to send POST data with axios)

// THIS IS OUR POST ROUTE FOR CREATING USERS
app.post("/user/create", async (req, res) => {
  // THIS IS EVERYTHING INSIDE THE ROUTE

  // REQ.BODY = WHATEVER IS BEING SENT TO SERVER
  console.log(req.body);

  if (!req.body.email) {
    return res.json({
      success: false,
      message: "you did not provide an email address",
    });
  }

  // STORE REQ.BODY INSIDE THE DATABASE
  let responseFromDatabase = await User.create(req.body);
  console.log(responseFromDatabase);

  return res.json({ success: true });
});
// END OF OUR ROUTE

// THIS IS OUR TEST ROUTE
app.get("/", async (req, res) => {
  res.send("Hello World");
});
// END OF OUR TEST ROUTE

// STARTING THE EXPRESS SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
