require("dotenv").config();

// import variables
let dbConnectionString = process.env.DB_URL;

// import packages
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

// import password hasher
const bcrypt = require("bcrypt");
const saltRounds = 10;

const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 80;

// import models
const User = require("./models/User");
const Auth = require("./models/Auth");

const { response } = require("express");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbConnectionString);
}
// THIS IS EVERYTHING INSIDE THE ROUTE
// REQ.BODY = WHATEVER IS BEING SENT TO SERVER

// create object called user, copy it from req.body
// check all properties if they exist + correct
// check if minimum lengths are correct

// hash password
// store user in database
// return a response to the frontend

// if something goes wrong we send another response to frontend
// frontend should be able to check if it succeeded or not

// OUR REGISTRATION ROUTE
app.post("/user/create", async (req, res) => {
  try {
    // do all of our stuff
    // (firstName, lastName, email, password)
    let newUser = req.body;

    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.password
    ) {
      throw new Error("missing user details");
    }

    // check all the lengths and additional requirements
    // hash password with bcrypt
    // password -> apply mathematical formula -> hash
    // cannot go backwords, cannot decrypt hash to password

    let hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

    // mongoose is the package to communicate with MONGODB
    // mongodb is the place where we store things (database)

    let databaseResponse = await User.create({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      password: hashedPassword,
      email: newUser.email,
    });

    console.log("USER HAS BEEN CREATED", databaseResponse);
    return res.json({ success: true }); // send a message that the call succeeded
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: e.message }); // send a message to frontend that something went wrong
  }
});
// END OF OUR ROUTE

// LOGIN ROUTE
app.post("/user/login", async (req, res) => {
  try {
    console.log(req.body);
    // validate input
    let userInput = req.body; // req.body is object we get from frontend

    // we need to ensure that we have email address and a password

    // lookup a user by email
    // we get object back from database if it exists
    let userInDatabase = await User.findOne({ email: userInput.email });

    let comp = await bcrypt.compare(
      userInput.password,
      userInDatabase.password
    );

    // hash the password that the user submitted
    // compare the database hashed password with this password
    // if they are the same the user is legit
    if (comp == false) {
      throw new Error("incorrect password");
    }

    // give them a token (make one up)
    // this token will be stored in their browser
    // everytime from then on when they interact with backend they
    // will send us this token

    let userToken = uuidv4();

    // see if a auth already exists in database and delete all instances
    let existingAuth = await Auth.deleteMany({ userId: userInDatabase.id });

    // create new auth
    let auth = await Auth.create({
      token: userToken,
      userId: userInDatabase.id,
      expiry: moment().add(2, "days"),
    });

    // email
    // password -> token  // USERID, TOKEN, EXPIRATION

    // token will be random string and it will be saved in the database alongside their id
    // at the end we give them a token

    return res.json({
      success: true,
      auth: { token: auth.token, expiry: auth.expiry },
      firstName: userInDatabase.firstName,
    });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

// THIS IS OUR TEST ROUTE
app.get("/", async (req, res) => {
  res.send("Hello World");
});
// END OF OUR TEST ROUTE

// STARTING THE EXPRESS SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
