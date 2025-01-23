require("dotenv").config();
const express = require("express");
const { dbConnect } = require("./config/dbConnection");

const path = require("path");
const cookieParser = require("cookie-parser");
const cluster = require("cluster");
//calculating no. of cpu's available
const numCPUs = require("node:os").availableParallelism();

const {
  checkAuthCookie,
  restrictToLoggedinUserOnly,
} = require("./middlewares/authentication");

//home-page controller
const { homeRouteController } = require("./controllers/home");
//importing routes
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

const app = express();
const PORT = process.env.PORT || 8000;

//middlewares
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve(__dirname, "./public")));

//db connection
dbConnect();

//connecting with cloudinary
const cloudinaryConnect = require("./config/cloudinary");
cloudinaryConnect();

//making 16 clusters
if (cluster.isPrimary) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  //if worker dies, restart it
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  //home route --> default one
  app.get("/", homeRouteController);

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
}
