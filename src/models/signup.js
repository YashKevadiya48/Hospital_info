const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CreateSignupSchema = mongoose.Schema({
    firstname : {
        type : String,
        required : true,
    },
    lastname : {
        type : String,
        required : true,
    },
    adminname : {
        type : String,
        required : true,
        unique : true
    },
    emailid : {
        type : String,
        required : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        }
    },
    mobileno : {
        type : Number,
        required : true,
        unique : true,
        min : 10
    },
    password : {
        type : String,
        required : [true, "Password is Required"]
    },
    cfmpassword : {
        type : String,
        required : [true, "Confirm Password is required"]
    },
    profilephoto : {
        type : String,
        required : [true, "Profile Photo is required."]
    },
    address : {
        type : String,
        required : [true, "Address is Required"]
    },
    pincode : {
        type : Number,
        required : [true, "Pincode is reuired"],
        min : 6
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
});

//Generate JsonWebToken
CreateSignupSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id : this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token : token});
        await this.save();
        return token;
    }
    catch(err){
        res.status(401).send(`The error Part ${err}`);
    }
}

// Encrypt Password
CreateSignupSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.cfmpassword = await bcrypt.hash(this.cfmpassword,10);
    }
    next();
});

const CreateSignupModel = mongoose.model("admininfo",CreateSignupSchema);

module.exports = CreateSignupModel;