require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const hbs = require("hbs");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fileupload = require("express-fileupload");
// Connection with database
require("./db/conn");
const AdminCollection = require("./models/signup");
const HosCollection = require("./models/hospital_details");
const BedCollection = require("./models/bed_details");

// Express Middleware
app.use(express.urlencoded({extended : true}));

// require auth middleware
const auth = require("./middleware/auth");
const { findOneAndUpdate, findByIdAndDelete } = require("./models/signup");
const { Cookie } = require("express-session");

// Use Cookie Parser
app.use(cookieParser());

// Use Express-Session 
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
    cookie: {maxAge: null}
}));

app.use((req, res, next)=>{
res.locals.message = req.session.message
delete req.session.message
next()
});
// file uploaded
app.use(fileupload());

// Define Static Path
const static_path = path.join(__dirname,"../public");
app.use(express.static(static_path));

// set engine
app.set("view engine","hbs");

// view engine path
const view_path = path.join(__dirname,"../templates/views");
app.set("views", view_path);

// Partials path
const partials_path = path.join(__dirname,"../templates/partials");
hbs.registerPartials(partials_path);

app.get("/",(req,res) =>{
    res.render("index");
});

app.get("/plasma",(req,res) =>{
    res.render("plasma");
});

app.get("/login",(req,res) =>{
    res.render("admin/login");
});

app.get("/signup",(req,res) =>{
    res.render("admin/signup");
});

app.get("/forgate",(req,res) =>{
    res.render("admin/forgate");
});

app.get("/match-otp",(req,res) =>{
    res.render("admin/match-otp");
});

app.get("/forgate-password",(req,res) =>{
    res.render("admin/forgate-password");
});

app.get("/admin_header1",auth, async(req,res) =>{
    try{
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.redirect('/login');
        }
        else{
            const GetProfileInfo = await AdminCollection.find({_id : req.user._id},{},function(e,data) {
                res.render("partials/admin_header1",{"admindata" : data});    
                console.log(data);
            })
        }
    }
    catch(err){
        res.send(err);
    }
})
app.get("/hospital-data-table",auth, async(req,res) =>{
    try{
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.render("admin/login");
        }
        else{
            const GetHospitalInfo = await HosCollection.find({admin_id : req.user._id},{},function(e,data){
                if(e) throw e;
                res.render("admin/hospital-data-table",{"hospitaldata" : data});
            });
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

app.get("/beds-data-table",auth, async(req,res) =>{
    try{
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.render("admin/login");
        }
        else{
            const GetBedInfo = await BedCollection.find({admin_id : req.user._id},{},function(e,data){
                if(e) throw e;
                res.render("admin/beds-data-table",{"beddata" : data});
            });
        }
    }
    catch(err){
        res.status(400).send(err);
    }
    
});

app.get("/plasma-data-table",auth, async(req,res) =>{
    const cookie = req.cookies.loginCookie;
    if(cookie == null){
        res.render("admin/login");
    }
    else{
        const GetPlasmaData = await HosCollection.find({$and : [{admin_id : req.user._id},{category : "Plasma"}]},{},function(err,data){
            if(err) throw err;
            res.render("admin/plasma-data-table",{"plasmadata" : data});
        })
        console.log(GetPlasmaData);
    }
});

app.get("/hospital-details",auth, (req,res) =>{
    const cookie = req.cookies.loginCookie;
    if(cookie == null){
       res.render("admin/login");
    }
    else{
       res.render("admin/hospital-details");
    }
});

app.get("/update-hospital/:id",auth, async(req,res) =>{
    try{
        const id = req.params.id;
        console.log(id);
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.render("admin/login");
        }
        else{
            const GetHosInfo = await HosCollection.find({_id : id},{},function(e,hosdata){
                if(e) throw e;
                res.render("admin/update-hospital",{"updatehosinfo" : hosdata});
            });
        }
    }
    catch(err){
        res.status(401).send(err);
    }    
});

app.delete("/delete-hospital/:id",auth, async(req,res) =>{
    try{
        const _id = req.params.id;
        console.log(_id);
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            req.session.message = {
                type : 'danger',
                intro : 'Ohh! you are not login',
                message : 'please login'
            }
            res.redirect("/login");
        }
        else{
            const deletehos = await HosCollection.findByIdAndDelete({_id : _id},async(err) => {
                if(err) throw err;
                await BedCollection.findByIdAndDelete({admin_id : _id},function(err){
                    if(err) throw err;
                    req.session.message = {
                        type : 'success',
                        intro : '',
                        message : 'You have successfully deleted hospital details.'
                    }
                    res.redirect("/hospital-data-table");
                })
            })
        }
    }
    catch(err){
        res.status(401).send(err);
    }
    const cookie = req.cookies.loginCookie;    
})

app.get("/bed-details",auth, async(req,res) =>{
    const cookie = req.cookies.loginCookie;
    if(cookie == null){
        res.render("admin/login");
    }
    else{
        const GetHosName = await HosCollection.find({ $and : [{admin_id :req.user._id},{category : "Beds"}]},{},function(e,hdata){
            if(e) throw e;
            res.render("admin/bed-details",{"hospitalname" : hdata});
        });
    }
    
})
app.get("/update-bed-details/:id",auth, async(req,res) =>{
    try{
        const _id = req.params.id;
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.render("admin/login");
        }
        else{
            const UpdateBedInfo = await BedCollection.find({_id : _id},{},function(e,bdata){
                if(e) throw e;
                res.render("admin/update-bed-details",{"beddata" : bdata});
            });
        }
    }
    catch(err){
        res.status(401).send(err);
    }
    
});

app.get("/update-bed-details/:id",auth,async(req,res) =>{
    try{
        const _id = req.params.id;
        const cookie = req.cookies.loginCookie;
        if(Cookie == null){
            res.redirect("/login");
        }
        else{
            const bed_id = req.body.bed_id;
            console.log(bed_id);
            const UpdateBedData = await BedCollection.findByIdAndUpdate({_id : _id},{
                $set : {
                    awob : req.body.available_wo_bed,
                    twob : req.body.total_wo_bed,
                    awoob : req.body.available_woo_bed,
                    twoob : req.body.total_woo_bed,
                    aiwv : req.body.available_iwv_bed,
                    tiwv : req.body.total_iwv_bed,
                    aiwov : req.body.available_iwov_bed,
                    tiwov : req.body.total_iwov_bed,
                },
                new : true
            },async (e,data) =>{
                if(e) throw e;
                req.session.message = {
                    type : 'success',
                    intro : '',
                    message : 'You have successfully deleted hospital details.'
                }
                // const data1 = await UpdateBedData.save();
                // res.send(data1);
                res.redirect("/beds-data-table");
            })
        }
    }
    catch(err){
        res.status(400).send(err);
    }
})
app.delete("/delete-bed-details/:id",auth, async(req,res) =>{
    try{
        const _id = req.params.id;
        console.log(_id);
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            req.session.message = {
                type : 'danger',
                intro : 'Ohh! You are not login',
                message : 'Please Login'
            }
            res.redirect("/login");
        }
        else{
            const deletebed = await BedCollection.findByIdAndDelete({_id : _id},function(err){
                if(err) throw err;
                req.session.message = {
                    type : 'success',
                    intro : '',
                    message : 'You have successfully deleted bed details.'
                }
                res.redirect("/beds-data-table");
            })
        }
    }
    catch(err){
        res.status(401).send(err);
    }    
});

app.get("/profile",auth, async(req,res) =>{
    try{
        const cookie = req.cookies.loginCookie;
        if(cookie == null){
            res.render("admin/login");
        }
        else{
            const GetAdminInfo = await AdminCollection.find({_id : req.user._id},{},function(e,data){
                if(e) throw e;
                res.render("admin/profile",{"admindata" : data});
            });
        }
    }
    catch(err){
        res.status(401).send(err);
    }    
});

app.get("/logout",auth, async (req,res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((currElement) =>{
            return currElement.token !== req.token;
        })
        res.clearCookie("loginCookie");
        req.session.message = {
            type : 'success',
            intro : '',
            message : 'You have successfully logout.'
        }
        await req.user.save();
        res.redirect("/login");
    }
    catch(err){
        res.status(401).send("Logout Error");
    }
});

app.post("/signup", async(req,res) =>{
    try{
        if(req.body.fname != "" || req.body.fname != "" || req.body.lname != "" || req.body.uname != "" || req.body.email != "" || req.body.mobile != "" ||
           req.body.password != "" || req.body.repassword != "" || req.body.photo != "" || req.body.address != "" || req.body.pincode != ""){
            const password = req.body.password;
            const cpassword = req.body.repassword;
            if(password === cpassword){
                console.log(req.files);
                const file = req.files.photo;
                const validExt = ['jpeg','jpg','png'];
                const img_ext = file.name.substring(file.name.lastIndexOf('.')+1);
                const result = validExt.includes(img_ext);
                if(result != false){
                    if(file.size <= 3145728){
                        file.mv("public/upload/profile-photo/"+file.name, async(err,result) =>{
                            if(err) throw err;
                            const CreateSignupDocument = new AdminCollection({
                                firstname : req.body.fname,
                                lastname : req.body.lname,
                                adminname : req.body.uname,
                                emailid : req.body.email,
                                mobileno : req.body.mobile,
                                password : req.body.password,
                                cfmpassword : req.body.repassword,
                                profilephoto : req.files.photo.name,
                                address : req.body.address,
                                pincode : req.body.pincode
                            });
            
                            req.session.message = {
                                type: 'success',
                                intro: 'You are now registered! ',
                                message: 'Please log in.'
                            }
                            const result1 = await CreateSignupDocument.save();
                            console.log("signup successfully");
                            res.status(201).redirect("/login");
                        })
                    }
                    else{
                        req.session.message = {
                            type : 'danger',
                            intro : 'Your file size is more than 3mb.',
                            message : 'Please select file which size less than 3mb.'
                        }
                        res.redirect("/signup");
                    }
                }
                else{
                    req.session.message = {
                        type : 'danger',
                        intro : 'selected file is not image.',
                        message : 'please Select image file.'
                    }
                    res.redirect("/signup");
                }
            }
            else{
                req.session.message = {
                    type : 'danger',
                    intro : 'Password do not match!',
                    message : 'Please make sure to insert same password.'
                }
                res.redirect("/signup");
            }
        }
        else{
            req.session.message = {
                type : 'danger',
                intro : 'Empty fields!',
                message : 'Please insert the requested information.'
            }
            res.redirect("/signup");
        }
    }
    catch(err){
        res.status(400).send(err);
    }    
});

app.post("/login", async(req,res) =>{
    try{
        if(req.body.uname == '' || req.body.email == '' || req.body.password == ''){
            req.session.message = {
                type : 'danger',
                intro : 'Empty fields!',
                message : 'Please insert the requested information.'
            }
         res.redirect("/login");
        }
        else{
            const adminname = req.body.uname;
            const emailid = req.body.email;
            const password = req.body.password;
            const rememberme = req.body.rememberme;
            const GetAdminInfo = await AdminCollection.findOne({emailid : emailid});
            const isValid = await bcrypt.compare(password, GetAdminInfo.password)
            if(adminname == GetAdminInfo.adminname){
                if(isValid == true){
                    //Generate Token
                    const token = await GetAdminInfo.generateAuthToken();

                    // Store Token into Cookie
                    res.cookie("loginCookie",token);
                    // ,{
                    //     expires : new Date(Date.now() + 10000),
                    //     httpOnly : true,
                    //     // secure : true
                    // }

                    res.status(201).redirect("/hospital-data-table");
                }
                else{
                    req.session.message = {
                        type : 'danger',
                        intro : 'Login Error',
                        message : 'Please insert proper information.'
                    }
                    res.status(401).redirect("/login");
                }
            }   
            else{
                req.session.message = {
                    type : 'danger',
                    intro : 'Login Error',
                    message : 'Please insert proper information.'
                }
                res.status(401).redirect("/login");
            }
        }
    }
    catch(err){
        req.session.message = {
            type : 'danger',
            intro : 'Login Error',
            message : 'Please insert proper information.'
        }
        res.status(401).redirect("/login");
    }
});

app.post("/hospital-details",auth, async(req,res) =>{
    try{
        if(req.body.hospitalname != '' || req.body.hospitalowner != '' || req.body.hospitalphoto != '' || req.body.openingtime != '' || req.body.closeingtime != '' ||
        req.body.contectno != '' || req.body.hospitaladdress != '' || req.body.latitude != '' || req.body.longitude != '' || req.body.area != '' || req.body.pincode != '' || req.body.category != '' || req.body.discription != ''){
                console.log(req.files);
                const file = req.files.hospitalphoto;
                const validExt = ['jpeg','jpg','png'];
                const img_ext = file.name.substring(file.name.lastIndexOf('.')+1);
                const result = validExt.includes(img_ext);
                if(result != false){
                    if(file.size <= 3145728){
                        file.mv("public/upload/hospital-photo/"+file.name, async(err,result) =>{
                            if(err) throw err;
                            const CreateHosDocument = new HosCollection({
                                admin_id : req.user._id,
                                hospitalname : req.body.hospitalname,
                                hospitalowner : req.body.hospitalowner,
                                hospitalphoto : req.files.hospitalphoto,
                                hospitalopentime : req.body.openingtime,
                                hospitalclosetime : req.body.closeingtime,
                                contectno : req.body.contectno,
                                hospitaladdress : req.body.hospitaladdress,
                                hospitallatitude : req.body.latitude,
                                hospitallongitude : req.body.longitude,
                                hospitalarea : req.body.area,
                                areapincode : req.body.pincode,
                                category : req.body.category,
                                discription : req.body.discription
                            });
                            req.session.message = {
                                type : 'success',
                                intro : 'Congratulations!',
                                message : 'You have successfully added hospital details.'
                            }
                            const result1 = await CreateHosDocument.save();
                            res.status(200).redirect("/hospital-data-table");
                        })
                    }
                    else{
                        req.session.message = {
                            type : 'danger',
                            color : 'red',
                            intro : 'Your file size is more than 3mb.',
                            message : 'Please select file which size less than 3mb.'
                        }
                        res.redirect("/hospital-details");
                    }
                }
                else{
                    req.session.message = {
                        type : 'danger',
                        color : 'red',
                        intro : 'selected file is not image.',
                        message : 'please Select image file.'
                    }
                    res.redirect("/hospital-details");
                }
        }
        else{
            req.session.message = {
                type : 'danger',
                intro : 'Field is empty, ',
                message : 'Please Enter data'
            }
            res.redirect("/hospital-details");
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

app.post("/bed-details",auth, async(req,res) =>{
    try{
        
        const CreateBedDocument = new BedCollection({
            admin_id : req.user._id,
            // hospitalid : req.body.hospitalid,
            hospitalname : req.body.hospital_name,
            hospitalcategory : "Beds",
            awob : req.body.available_wo_bed,
            twob : req.body.total_wo_bed,
            awoob : req.body.available_woo_bed,
            twoob : req.body.total_woo_bed,
            aiwv : req.body.available_iwv_bed,
            tiwv : req.body.total_iwv_bed,
            aiwov : req.body.available_iwov_bed,
            tiwov : req.body.total_iwov_bed,
        });
        req.session.message = {
            type : 'success',
            intro : 'Congratulations!',
            message : 'You have successfully added Beds details.'
        }
        const result = await CreateBedDocument.save();
        console.log(CreateBedDocument);
        res.status(200).redirect("/beds-data-table");
    }
    catch(err){
        req.session.message = {
            type : 'danger',
            intro : err,
            message : 'is already exits',
        }
        res.status(401).redirect('/bed-details');
    }
});

app.put("/profile",auth,async(req,res) =>{
    // const UpdateProfile = async(_id) =>{
        try{
            const admin_id = req.user._id;
            const result = await AdminCollection.findByIdAndUpdate({_id : admin_id},{
                $set : {
                    firstname : req.body.fname,
                    lastname : req.body.lname,
                    adminname : req.body.uname,
                    emailid : req.body.email,
                    mobileno : req.body.mobile,
                    profilephoto : req.body.photo,
                    address : req.body.address,
                    pincode : req.body.pincode
                },
                new : true
            })
            req.session.message = {
                type : 'success',
                intro : 'Congratulations!',
                message : 'You have successfully Update profile details.'
            }
            console.log(result);
             result.save();
            res.redirect("/profile");
        }
        catch(err){
            res.send(err);
        }
    // }
    // UpdateProfile(req.user._id)

});

app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});