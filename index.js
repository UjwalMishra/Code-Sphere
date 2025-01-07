require("dotenv").config();
const express = require("express");
const { dbConnect } = require("./config/dbConnection");

const path = require("path");
const cookieParser = require("cookie-parser");

const {
  checkAuthCookie,
  restrictToLoggedinUserOnly,
} = require("./middlewares/authentication");

//importing routes
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
//importing Model
const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8000;

//middlewares
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extented: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve(__dirname, "./public")));

//db connection
dbConnect();

//connecting with cloudinary
const cloudinaryConnect = require("./config/cloudinary");
cloudinaryConnect();

//home route --> default one
app.get("/", async (req, res) => {
  const { category } = req.query || "";

  let filter = {};
  if (category) {
    filter.category = category;
  }

  try {
    const allBlogs = await Blog.find(filter);
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (err) {
    console.log(err);
  }
});

//other routes
app.use("/user", userRoutes);
app.use("/blog", restrictToLoggedinUserOnly, blogRoutes);
//error handling for routes
app.use((req, res, next) => {
  res.status(404).render("404", { error: "Page Not Found" });
});
//server error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: "Something went wrong!" });
});

app.listen(PORT, () => console.log("Server started at", PORT));
