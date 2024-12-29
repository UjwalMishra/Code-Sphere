const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log("DB connection successful"))
    .catch((err) => console.error("DB connection error:", err));
};
