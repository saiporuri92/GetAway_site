var mongoose = require("mongoose");
//schema setup
var getawaySchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    comments :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});

module.exports = mongoose.model("Getaway",getawaySchema);