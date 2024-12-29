const User = require("../models/users");
const {createTokenForUser} = require("../services/authentication");
const bcrypt = require('bcrypt');

const signupController = async(req,res)=>{
    const {name,email,password} = req.body;
    //do validations here
    await User.create({
        name,
        email,
        password,
    });
    return res.redirect("/");
}

const signinController = async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
       return res.render("signin",{
            error : "Please enter both email and password"
        });
    }
    const user = await User.findOne({email});
    if(!user){
        return res.render("signin",{
        error : "User not found, Please signup"
        });
    };
    const isMatch = await bcrypt.compare(password,user.password);
    
    if(!isMatch){
        return res.render("signin",{
            error : "Incorrect Password"
        });
    }
    user.password = undefined;
    console.log(user);

    //returning token
    const token = createTokenForUser(user);

    return res.cookie("token",token).redirect("/");
}

module.exports = {
    signupController,
    signinController
}