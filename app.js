//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'


mongoose.connect("mongodb://localhost:27017/loginDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("login");
});
app.get("/signup", function(req, res) {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  username = req.body.username;
  plainTextPassword = req.body.pass;

  if (!username || typeof username !== 'string') {
    return res.json({
      status: 'error',
      error: 'Invalid username'
    })
  }

  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({
      status: 'error',
      error: 'Invalid password'
    })
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: 'Password too small. Should be atleast 6 characters'
    })
  }

  password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await User.create({
      username,
      password
    })
    console.log('User created successfully: ', response)
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({
        status: 'error',
        error: 'Username already in use'
      })
    }
    throw error
  }
res.redirect("/");
  // res.json({
  //   status: 'ok'
  // })
  // console.log(password);
  // console.log(await bcrypt.hash(password,10));
});

app.post("/search",function(req,res){
  res.send("Hello");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.pass;
  const user = await User.findOne({
    username
  }).lean()

  if (!user) {
    return res.json({
      status: 'error',
      error: 'Invalid username/password'
    })
  }

  if (await bcrypt.compare(password, user.password)) {
    // the username, password combination is successful

    const token = jwt.sign({
        id: user._id,
        username: user.username
      },
      JWT_SECRET
    )

    // return res.json({
    //   status: 'ok'
    // })
    res.render("home");
  }

  else{
    return res.json({
      status: 'error',
      error: 'Invalid username/password'
    })
  }

});


app.listen(3000, function() {
  console.log("Server has startrd Successfully");
});
