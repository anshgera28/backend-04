const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("./models/user");
const cookieParser = require("cookie-parser");
const path = require("path");               
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/authtestapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/create", async (req, res) => {
    try {
        const {username, email, password, age} = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hash = await bcrypt.hash(password, 10);
        const createdUser = await UserModel.create({
            username,
            email,
            password: hash,
            age
        });

        const token = jwt.sign({email: createdUser.email}, "secret", { expiresIn: '24h' });
        res.cookie("token", token, { httpOnly: true });
        
        res.status(201).json({
            message: 'User created successfully',
            user: {
                username: createdUser.username,
                email: createdUser.email,
                age: createdUser.age
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", async function (req, res) {
    let user = await UserModel.findOne({email: req.body.email});
    if(!user) return res.send("Invalid credentials");
    
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(!result) return res.send("Invalid credentials");
        res.send("Login successful");
    })
});

app.get("/logout", async (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});