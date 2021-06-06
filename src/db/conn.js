const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/hospital_info",{ useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify : false})
.then(() =>{
    console.log("connection successfully ...");
})
.catch((err) =>{
    console.log(`Connection not establish ${err}`);
})