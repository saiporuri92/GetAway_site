var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Getaway = require("./models/getaway");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");

mongoose.connect("mongodb://localhost/travel_blog_v4");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "public"));
seedDB();

//configure passport
app.use(require("express-session")({
    secret : "Once again",
    resave:false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Getaway.create({
//     name:"Los Cabos",
//     image:"https://images.unsplash.com/photo-1521750465-672a0f580901?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2475f7cfbc121fcc7e9393827742a662&auto=format&fit=crop&w=967&q=80",
//      description:"this is located in mexico"
// },function(err,getaway){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("new get away");
//         console.log(getaway);
//     }
// });

// var getaways = [
//         {name:"achmelvich",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"},
//         {name:"alvord_desert",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"},
//         {name:"antholzer_sea",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"},
//         {name:"bad_pyrmont",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"},
//         {name:"bali",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"},
//         {name:"cataratas",image:"https://images.unsplash.com/photo-1527109525289-f0768b12d0be?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d2aff663ebeb6182630b064db0a80d46&auto=format&fit=crop&w=1134&q=80"}
//         ];
        
app.get("/",function(req,res){
    res.render("home");
});

//show the list of locations
app.get("/getaways",function(req,res){
    Getaway.find({},function(err,allgetaways){
        if(err){
            console.log(err);
        }else{
            res.render("getaways/getaways",{getaways:allgetaways});
        }
    });
});

//add a new location
app.post("/getaways",function(req,res){
   //get data from form to the getaways array and redirect to the main page
//   res.send("you hit the post route")
   var name = req.body.name;
   var image = req.body.image;
   var description = req.body.description;
   var newLocation = {name:name,image:image,description:description};
   
   //create a new getaway and save it to database
   Getaway.create(newLocation,function(err,newgetaway){
       if(err){
           console.log("some error happened");
       }else{
           res.redirect("getaways/getaways");
       }
   });
//   getaways.push(newLocation);
//   res.redirect("/getaways");
   
});


//show form to create new getaway
app.get("/getaways/new",function(req, res) {
   res.render("getaways/new"); 
});

//shows more info about a campground
app.get("/getaways/:id",function(req, res) {
    Getaway.findById(req.params.id).populate("comments").exec(function(err,foundgetaway){
        if(err){
            console.log("error happened");
        }
        else{
            res.render("getaways/show",{getaway:foundgetaway});
        }
    });
    // res.render("show.ejs");
});

//routes for comments
app.get("/getaways/:id/comments/new",isLoggedIn,function(req,res){
    //find the location by id
    Getaway.findById(req.params.id,function(err,getaway){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{getaway:getaway});
        }
    });
});

app.post("/getaways/:id/comments",function(req,res){
    //find the location
    Getaway.findById(req.params.id,function(err,getaway){
        if(err){
            console.log(err);
            res.redirect("/getaways");
        }else{
            console.log(req.body.comment);
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    getaway.comments.push(comment);
                    getaway.save();
                    res.redirect("/getaways/" + getaway._id);
                }
            });
        }
    });
});
//end of routes for comments

//authentication routes
//show register form
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req, res) {
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/getaways");
        });
    });
});

//show login form
app.get("/login",function(req, res) {
    res.render("login");
});
//app.post(route,middleware,callback)
app.post("/login",passport.authenticate("local",
    {
        successRedirect:"/getaways",
        failureRedirect : "/login"
    }),function(req,res){
    res.send("login here");
});


app.get("/logout",function(req, res) {
    req.logout();
    req.redirect("/getaways");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server has started");
});