//require configs
var expressSanitizer  = require("express-sanitizer"),
    methodOverride    = require("method-override"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    express           = require("express"),
    app               = express();
    
//app config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose config
mongoose.connect("mongodb://localhost/restful-blog", {useMongoClient: true});
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now()}
});
var Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES

//Root - redirects to blog index
app.get("/", function(req, res){
  res.redirect("/blogs");
});

//INDEX - list of all blog posts
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, posts){
      if (err){
        console.log(err);
      }
      else {
        res.render("index", {blogs: posts});
      }
    });
});

//NEW - input form for making new posts
app.get("/blogs/new", function(req,res){
  res.render("new");
});

//CREATE
app.post("/blogs", function(req, res){
  //sanitize input body
  req.body.blog.body = req.sanitize(req.body.blog.body);
  //create new blog
    Blog.create(req.body.blog, function(err, posts){
      if (err){
        console.log(err);
      }
      else { //redirect to index page after adding to database
        res.redirect("/blogs");
      }
    });
});

//SHOW - show a single post
app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      console.log("No such blog by id"+req.params.id);
      res.redirect("/blogs");
    } else{
      res.render("show", {blog: foundBlog});
    }
  });
});

//EDIT - edit form for a blog post
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      console.log("No such blog by id"+req.params.id);
      res.redirect("/blogs");
    } else{
      res.render("edit", {blog: foundBlog});
    }
  });
});

//UPDATE
app.put("/blogs/:id", function(req, res){
  //sanitize input body
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, editBlog){
    if(err){
      console.log("No such blog by id"+req.params.id);
      res.redirect("/blogs");
    } else{
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE
app.delete("/blogs/:id", function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err, editBlog){
    if(err){
      console.log("No such blog by id" + req.params.id);
      res.redirect("/blogs");
    } else{
      console.log("Post Deleted. ID: " + req.params.id)
      res.redirect("/blogs/");
    }
  });
});

//start listening on env.PORT and env.IP (external environmental variables to protect keys and such)
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("blog server is listening...");
});