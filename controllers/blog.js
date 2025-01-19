const multer = require("multer");
const cloudinary = require("cloudinary").v2;
// const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

// Multer Storage (Use Memory Storage for Buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
  fileFilter: (req, file, cb) => {
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
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

    if (!title || !desc || !category) {
      return res.status(400).render("404", {
        message: "Missing required fields",
        error: "Title, description, and category are required.",
      });
    }

    if (!fileVal) {
      return res.status(400).render("404", {
        message: "Error adding blog",
        error: "Please upload a valid image file.",
      });
    }

    // Upload to Cloudinary
    const response = await uploadFileToCloudinary(
      fileVal.buffer,
      "fileUploaderAppCloudinary"
    );

    const blog = await Blog.create({
      title,
      body: desc,
      videoLink,
      category,
      coverImgUrl: response.secure_url,
      createdBy: req.user._id,
      cloudinary_public_id: response.public_id,
    });

    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error adding blog:", err);
    res.status(500).render("500", {
      message: "Error adding blog",
      error: "An unexpected error occurred. Please try again later.",
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

const deleteMyBlogController = async (req, res) => {
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
};

const fetchMyBlogController = async (req, res) => {
  const id = req.user._id;
  const blogs = await Blog.find({ createdBy: id }).populate("createdBy");
  return res.render("myblogs", {
    user: req.user,
    blogs,
  });
};

const addBlogGetController = (req, res) => {
  return res.render("addBlogs", {
    user: req.user,
  });
};

const fetchParticularBlogController = async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate("createdBy");
  const comments = await Comment.find({ blogId: id }).populate("createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
};

// Exporting
module.exports = {
  upload,
  addBlogController,
  createCommentController,
  deleteMyBlogController,
  fetchMyBlogController,
  addBlogGetController,
  fetchParticularBlogController,
};
