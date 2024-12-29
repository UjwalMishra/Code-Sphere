const path = require("path");
const cookieParser = require("cookie-parser");
//importing routes 
const userRoutes = require("./routes/user");


const express = require("express");
const { dbConnect } = require("./config/dbConnection");
const checkAuthCookie = require("./middlewares/authentication");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;


//middlewares
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({extented:false}));
app.use(cookieParser());
app.use(checkAuthCookie("token"));

//db connection
dbConnect();

app.get("/",(req,res) => {
    res.render("home",{
        user : req.user,
    });
});
//routes
app.use("/user",userRoutes);

app.listen(PORT, ()=> console.log("Server started at",PORT));