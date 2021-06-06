const mongoose = require("mongoose");

const CreateBedSchema = mongoose.Schema({
    admin_id : {
        type : String,
        required : true,
    },
    hospitalname : {
        type : String,
        required : true,
    },
    hospitalcategory : {
        type : String,
        required : true,
    },
    awob : {
        type : Number,
        required : true,
    },
    twob : {
        type : Number,
        required : true,
    },
    awoob : {
        type : Number,
        required : true
    },
    twoob : {
        type : Number,
        required : true
    },
    aiwv : {
        type : Number,
        required : true
    },
    tiwv : {
        type : Number,
        required : true
    },
    aiwov : {
        type : Number,
        required : true
    },
    tiwov : {
        type : Number,
        required : true
    },
});

const CreateBedCollection = mongoose.model("bed_detail",CreateBedSchema);

module.exports = CreateBedCollection;
