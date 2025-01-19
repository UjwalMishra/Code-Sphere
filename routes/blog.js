const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const express = require("express");
const {
  upload,
  addBlogController,
  createCommentController,
  deleteMyBlogController,
  fetchMyBlogController,
  addBlogGetController,
  fetchParticularBlogController,
} = require("../controllers/blog");

const Blog = require("../models/blog");
const Comment = require("../models/comment");
const authorizationToAdminAndModerator = require("../middlewares/authorization");

const router = express.Router();

router.get("/addblog", authorizationToAdminAndModerator, addBlogGetController);
router.get("/myblogs", authorizationToAdminAndModerator, fetchMyBlogController);

router.get("/:id", fetchParticularBlogController);

router.post(
  "/",
  (req, res, next) => {
    upload.single("coverImg")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        return res.status(400).render("404", {
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        // Handle other errors (e.g., unsupported file types)
        return res.status(400).render("404", {
          message: "Invalid image file",
          error:
            err.message +
            "!  Supported file types are: .jpg, .jpeg, .png, .webp",
        });
      }
      next();
    });
  },

  // Proceed with your controller logic if file upload is successful
  addBlogController
);
router.post("/comment/:blogId", createCommentController);
router.post("/deleteblog/:id", deleteMyBlogController);

module.exports = router;
