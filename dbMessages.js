const mongoose = require('mongoose');
const messageSchema = mongoose.Schema({
    message:String,
    name:String,
    timeStamp:String,
    recived:Boolean,
});

module.exports =  mongoose.model("messagecontents",messageSchema);//setting up collection and data structure