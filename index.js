require("dotenv").config();
const express = require("express");
const { dbConnect } = require("./config/dbConnection");
const path = require("path");
const cookieParser = require("cookie-parser");

const {
  checkAuthCookie,
  restrictToLoggedinUserOnly,
} = require("./middlewares/authentication");

// Home-page controller
const { homeRouteController } = require("./controllers/home");
// Importing routes
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve(__dirname, "./public")));

// Database connection
try {
  dbConnect();
  console.log("Database connected successfully");
} catch (err) {
  console.error("Database connection failed:", err);
}

// Cloudinary connection
try {
  const cloudinaryConnect = require("./config/cloudinary");
  cloudinaryConnect();
  console.log("Cloudinary connected successfully");
} catch (err) {
  console.error("Cloudinary connection failed:", err);
}

// Home route --> default one
app.get("/", homeRouteController);

// Other routes
app.use("/user", userRoutes);
app.use("/blog", restrictToLoggedinUserOnly, blogRoutes);

// Error handling for routes
app.use((req, res, next) => {
  res.status(404).render("404", { error: "Page Not Found" });
});

// Server error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: "Something went wrong!" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// For Vercel
module.exports = app; // Export the app for Vercel
