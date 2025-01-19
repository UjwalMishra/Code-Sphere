const Blog = require("../models/blog");

const homeRouteController = async (req, res) => {
  const { category, language } = req.query || {};

  let filter = {};
  // Filter by category if provided
  if (category) {
    filter.category = category;
  }

  // Filter by language based on the title (Hindi/English)
  if (language) {
    if (language === "hindi") {
      filter.title = { $regex: "Hindi", $options: "i" }; // Case-insensitive search for 'Hindi'
    } else if (language === "english") {
      filter.title = { $not: { $regex: "Hindi", $options: "i" } }; // Exclude titles containing 'Hindi'
    }
  }

  try {
    //finding blogs using filter object
    const allBlogs = await Blog.find(filter);
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
      selectedCategory: category,
      selectedLanguage: language,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { homeRouteController };
