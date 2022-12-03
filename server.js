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
const Class = require("./models/Class");
const { find } = require("./models/User");

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

//SKELETON FOR ROUTE
// app.post("/class/create", async (req, res) => {
//   try {
//     return res.json({ success: true });
//   } catch(e) {
//     return res.json({ success: false, message: e.message });
//   }
// });

// return all classes for a specific user
app.post("/user/classes", async (req, res) => {
  try {
    let userToken = req.body.token;
    // validate user token
    // see which user belongs to this token
    let auth = await Auth.findOne({ token: userToken });

    let userId = auth.userId;
    if (!userId) throw new Error("token is invalid");

    let userInDatabase = await User.findOne({ _id: userId });
    if (!userInDatabase) throw new Error("user does not exist");

    let ids = userInDatabase.registeredClasses;
    let userClasses = await Class.find().where("_id").in(ids).exec();

    return res.json({ success: true, classes: userClasses });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

// register user for class
// store user on class
// store class on user -> adjust model first
// decrease the number of students left
// when no spots left do not allow registration

// userToken -> find userId
// classId -> find class

app.post("/class/register", async (req, res) => {
  try {
    let data = req.body;
    let classId = data.classId;
    let userToken = req.body.token;

    // validate user token
    // see which user belongs to this token
    let auth = await Auth.findOne({ token: userToken });

    let userId = auth.userId;
    if (!userId) throw new Error("token is invalid");

    let userInDatabase = await User.findOne({ _id: userId });
    if (!userInDatabase) throw new Error("user does not exist");
    // get yoga class
    let yogaClass = await Class.findOne({ _id: classId });
    // establish rules
    if (yogaClass.capacity < 1) throw new Error("class full");
    if (yogaClass.registeredUsers.indexOf(userId) != -1)
      throw new Error("user is already registered");

    // apply changes
    yogaClass.registeredUsers.push(userId);
    yogaClass.capacity = yogaClass.capacity - 1;
    await yogaClass.save();

    if (!userInDatabase.registeredClasses) {
      userInDatabase.registeredClasses = [];
    }
    userInDatabase.registeredClasses.push(classId);
    await userInDatabase.save();

    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

app.post("/class/deregister", async (req, res) => {
  try {
    let data = req.body;
    let classId = data.classId;
    let userToken = req.body.token;
    // validate user token
    // see which user belongs to this token
    let auth = await Auth.findOne({ token: userToken });

    let userId = auth.userId;
    if (!userId) throw new Error("token is invalid");

    let userInDatabase = await User.findOne({ _id: userId });
    if (!userInDatabase) throw new Error("user does not exist");
    // get yoga class
    let yogaClass = await Class.findOne({ _id: classId });
    // establish rules

    if (yogaClass.registeredUsers.indexOf(userId) == -1)
      throw new Error("user is not registered in this class");

    yogaClass.registeredUsers = yogaClass.registeredUsers.filter(
      (student) => student !== userId
    );
    yogaClass.capacity += 1;
    await yogaClass.save();

    if (!userInDatabase.registeredClasses) {
      userInDatabase.registeredClasses = [];
    }

    let updatedClasses = userInDatabase.registeredClasses.filter(
      (yoga) => yoga !== classId
    );

    userInDatabase.registeredClasses = updatedClasses;
    userInDatabase.save();

    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

app.get("/class/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // get yoga class
    let classToEdit = await Class.findById(id);

    return res.json({ success: true, classToEdit });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: e.message });
  }
});

app.post("/class/edit", async (req, res) => {
  try {
    let data = req.body;
    let classId = data.classId;
    let userToken = req.body.token;
    // validate user token
    // see which user belongs to this token
    let auth = await Auth.findOne({ token: userToken });

    let userId = auth.userId;
    if (!userId) throw new Error("token is invalid");

    let userInDatabase = await User.findOne({ _id: userId });
    if (!userInDatabase) throw new Error("user does not exist");
    // get yoga class
    let yogaClass = await Class.findOne({ _id: classId });
    // establish rules

    await yogaClass.save();

    return res.json({ success: true });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: e.message });
  }
});

app.post("/class/delete", async (req, res) => {
  try {
    let data = req.body;
    let classId = data.classId;
    let userToken = req.body.token;
    // validate user token
    // see which user belongs to this token
    let auth = await Auth.findOne({ token: userToken });

    let userId = auth.userId;
    if (!userId) throw new Error("token is invalid");

    let yogaClass = await Class.findOne({ _id: classId });

    if (yogaClass.registeredUsers.length > 0) {
      throw new Error("cannot delete class with users registered");
    }

    await yogaClass.remove();

    return res.json({ success: true });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: e.message });
  }
});

app.get("/classes", async (req, res) => {
  let start = req.query.start; // timestamp
  let days = req.query.days; // days

  let startDate = moment.unix(start).toDate(); // convert timestamp back to a javascript date
  let endDate = moment.unix(start).add(days, "days").toDate(); // add 7 days to this date

  try {
    let classes = await Class.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    return res.json({ success: true, classes });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

// OUR CLASS CREATION ROUTE
app.post("/class/create", async (req, res) => {
  try {
    let newClass = req.body;

    if (
      !newClass.type ||
      !newClass.date ||
      !newClass.time ||
      !newClass.teacher ||
      !newClass.capacity ||
      !newClass.duration
    ) {
      throw new Error("missing class details");
    }
    // store in db
    let databaseResponse = await Class.create({
      type: newClass.type,
      date: newClass.date,
      time: newClass.time,
      teacher: newClass.teacher,
      capacity: newClass.capacity,
      duration: newClass.duration,
      registeredUsers: [],
    });

    console.log("CLASS HAS BEEN ADDED", databaseResponse);

    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
});

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

    // email already exist
    let user = await User.findOne({ email: newUser.email });
    if (user) throw new Error("email address already in use");

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
    // validate input
    let userInput = req.body; // req.body is object we get from frontend

    // we need to ensure that we have email address and a password
    // lookup a user by email
    // we get object back from database if it exists
    let userInDatabase = await User.findOne({ email: userInput.email });
    if (!userInDatabase) throw new Error("user does not exist");

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
      isAdmin: userInDatabase.isAdmin,
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
