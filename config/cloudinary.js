const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cloudinaryConnect = () => {
  try {
    //connecting with cloudinary using .config method
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = cloudinaryConnect;
