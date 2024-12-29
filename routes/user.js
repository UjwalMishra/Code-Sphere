const express = require("express");
const { signupController,signinController } = require("../controllers/user");


const router = express.Router();

router.get("/signin",(req,res)=>{
    res.render("signin");
});
router.get("/signup",(req,res)=>{
    res.render("signup");
});
router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/");
})
router.post("/signup",signupController);
router.post("/signin",signinController);
module.exports = router;