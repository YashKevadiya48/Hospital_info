const mongoose = require("mongoose");

const CreateHosDetailsSchema = mongoose.Schema({
    admin_id : {
        type : String,
        required : true,
    },
    hospitalname : {
        type : String,
        required : true,
        unique : true    
    },
    hospitalowner : {
        type : String,
        required : true,
        unique : true
    },
    hospitalphoto : {
        type : Object,
        required : true,
    },
    hospitalopentime : {
        type : String,
        required : true,
    },
    hospitalclosetime : {
        type : String,
        required : true,
    },
    contectno : {
        type : Number,
        required : true,
        unique : true
    },
    hospitaladdress : {
        type : String,
        required : true,
    },
    hospitallatitude : {
        type : Number,
        required : true,
    },
    hospitallongitude : {
        type : Number,
        required : true
    },
    hospitalarea : {
        type : String,
        required : true
    },
    areapincode : {
        type : Number,
        required : true
    },
    category : {
        type : String,
        required : true,
    },
    discription : {
        type : String,
        required : true,
    }
});

const CreateHospitalCollection = mongoose.model("hospital_detail",CreateHosDetailsSchema);

module.exports = CreateHospitalCollection;