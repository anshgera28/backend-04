const express = require("express");
const app = express();
const UserModel = require("./models/user");
const cookieParser = require("cookie-parser");
const path = require("path");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("cookieParser", cookieParser());




app.get("/", (req, res) => {
    res.render("index");
});

app.post("/create", async (req, res) => {
    let {username, email, password, age} = req.body;
    let createdUser = await UserModel.create({
        username,
        email,
        password,
        age
    });
    res.send(createdUser);
});

app.listen(3000);      