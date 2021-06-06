const jwt = require("jsonwebtoken");
const AdminCollection = require("../models/signup");

const auth = async(req,res,next) =>{
    try{
        const token = req.cookies.loginCookie;
        const verifyUser = await jwt.verify(token,process.env.SECRET_KEY);

        const user = await AdminCollection.findOne({_id : verifyUser._id});

        req.token = token;
        req.user = user;
        next();
    }
    catch(err){
        res.status(401).render("admin/login");
    }
}

module.exports = auth;