const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

const addBlogController = async (req, res) => {
  const { title, desc, videoLink, category } = req.body;
  const blog = await Blog.create({
    title: title,
    body: desc,
    videoLink: videoLink,
    category: category,
    coverImgUrl: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${blog._id}`);
};

const createCommentController = async (req, res) => {
  const { content } = req.body;
  const blogId = req.params.blogId;
  const createdBy = req.user._id;
  await Comment.create({
    content: content,
    blogId: blogId,
    createdBy: createdBy,
  });

  return res.redirect(`/blog/${blogId}`);
};

module.exports = {
  upload,
  addBlogController,
  createCommentController,
};
