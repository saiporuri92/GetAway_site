var mongoose = require("mongoose");
var getaway = require("./models/getaway");
var Comment = require("./models/comment");


var data =[
    {name:"image 1",
    image:"https://www.gettyimages.ca/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg",
    description:"just a random image"
    },
    {name:"image 2",
    image:"https://www.gettyimages.ca/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg",
    description:"just a random image"
    },
    {name:"image 3",
    image:"https://www.gettyimages.ca/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg",
    description:"just a random image"
    }]

module.exports = function seedDB(){
        //remove all the locations
        getaway.remove({},function(err){
        if(err){
            console.log(err);
        }
        console.log("removed the locations");
    
        //add new locations
        data.forEach(function(seed){
            getaway.create(seed,function(err,location){
                if(err){
                    console.log(err);
                }else{
                    console.log("added a location");
                    //create a comment
                    Comment.create({
                        text:"great place",
                        author:"someone"
                    },function(err,comment){
                        if(err){
                            console.log(err);
                        }else{
                            location.comments.push(comment);
                            location.save();
                            console.log("created the location");
                        }
                    });
                }
            });
        });
    });   
}