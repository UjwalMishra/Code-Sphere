const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

// Multer Storage (Use Memory Storage for Buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
  fileFilter: (req, file, cb) => {
    const supportedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
});

// Cloudinary Upload Function
async function uploadFileToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const options = { folder, resource_type: "auto" };
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
}

// Blog Controller
const addBlogController = async (req, res) => {
  try {
    const { title, desc, videoLink, category } = req.body;
    const fileVal = req.file;

    if (!fileVal) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary from buffer
    const response = await uploadFileToCloudinary(
      fileVal.buffer,
      "fileUploaderAppCloudinary"
    );

    // Create blog post with Cloudinary image URL
    const blog = await Blog.create({
      title: title,
      body: desc,
      videoLink: videoLink,
      category: category,
      coverImgUrl: response.secure_url, // Use Cloudinary URL
      createdBy: req.user._id,
      cloudinary_public_id: response.public_id,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error adding blog:", err);
    return res.status(500).json({
      message: "Error adding blog",
      error: err.message,
    });
  }
};

// Comment Controller
const createCommentController = async (req, res) => {
  try {
    const { content } = req.body;
    const blogId = req.params.blogId;
    const createdBy = req.user._id;
    await Comment.create({
      content: content,
      blogId: blogId,
      createdBy: createdBy,
    });

    return res.redirect(`/blog/${blogId}`);
  } catch (err) {
    console.error("Error creating comment:", err);
    return res.status(500).json({
      message: "Error creating comment",
      error: err.message,
    });
  }
};

// Exporting
module.exports = {
  upload,
  addBlogController,
  createCommentController,
};
