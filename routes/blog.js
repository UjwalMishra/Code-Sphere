const express = require("express");
const {
  upload,
  addBlogController,
  createCommentController,
} = require("../controllers/blog");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = express.Router();

router.get("/addblog", (req, res) => {
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

module.exports = router;
