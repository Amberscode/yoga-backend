require("dotenv").config();

// import variables
let dbConnectionString = process.env.DB_URL;

// import packages
const mongoose = require("mongoose");
const express = require("express");

const app = express();
const port = 80;

// import models
const User = require("./models/User");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbConnectionString);
}

app.get("/", async (req, res) => {
  //   const newUser = {
  //     firstName: "Marc",
  //     lastName: "Thalen",
  //     email: "marcthalen@gmail.com",
  //     password: "test123",
  //   };
  //   let response = await User.create(newUser);
  //   console.log(response);

  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
