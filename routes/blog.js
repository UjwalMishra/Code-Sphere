const cloudinary = require("cloudinary").v2;

const express = require("express");
const {
  upload,
  addBlogController,
  createCommentController,
} = require("../controllers/blog");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const authorizationToAdminAndModerator = require("../middlewares/authorization");

const router = express.Router();

router.get("/addblog", authorizationToAdminAndModerator, (req, res) => {
  return res.render("addblogs", {
    user: req.user,
  });
});
router.get("/myblogs", async (req, res) => {
  const id = req.user._id;
  const blogs = await Blog.find({ createdBy: id }).populate("createdBy");
  return res.render("myblogs", {
    user: req.user,
    blogs,
  });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate("createdBy");
  const comments = await Comment.find({ blogId: id }).populate("createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/", upload.single("coverImg"), addBlogController);
router.post("/comment/:blogId", createCommentController);

router.post("/deleteblog/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Find the blog in the database
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // If the blog has a Cloudinary public_id, delete the image
    if (blog.cloudinary_public_id) {
      try {
        // Attempt to delete the image from Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.destroy(
          blog.cloudinary_public_id
        );
      } catch (cloudinaryError) {
        return res.status(500).json({
          message: "Failed to delete image from Cloudinary",
          error: cloudinaryError.message,
        });
      }
    }
    // Delete the blog from the database
    await Blog.findByIdAndDelete(id);
    // Redirect to the user's blog list page
    return res.redirect("/blog/myblogs");
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting blog", error: err.message });
  }
});

module.exports = router;
