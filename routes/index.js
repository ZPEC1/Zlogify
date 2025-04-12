import express from "express";
import Blog from "../models/blogs.js";
import Users from "../models/Users.js";

const router = express.Router();

// Home Page
router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// Blog Listing (optional category filtering)
router.get("/blogs", async (req, res) => {
  const category = req.query.category || "All";

  try {
    const blogs = category === "All"
      ? await Blog.find().sort({ createdAt: -1 })
      : await Blog.find({ category: new RegExp(category, "i") }).sort({ createdAt: -1 });

    res.render("blogs", { category, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading blogs");
  }
});

// Blog Details
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    res.render("blogDetails", { blog });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching blog");
  }
});

// Render Blog Post Page
router.get("/post", (req, res) => {
  res.render("post");
});

// Handle New Blog Post
router.post("/blogs", async (req, res) => {
  const { email, name, title, category, content } = req.body;

  if (!email || !name || !title || !category || !content) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newBlog = new Blog({
      title,
      content,
      category,
      author: name,
      email,
    });

    await newBlog.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving blog post");
  }
});

// Edit blog page
router.get("/blogs/:id/edit", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).send("Blog not found");
  res.render("editBlog", { blog });
});

// Handle edit form submission
router.post("/blogs/:id/edit", async (req, res) => {
  const { title, name, email, category, content } = req.body;
  try {
    await Blog.findByIdAndUpdate(req.params.id, {
      title,
      author: name,
      email,
      category,
      content,
    });
    res.redirect(`/blogs/${req.params.id}`);
  } catch (err) {
    res.status(500).send("Failed to update blog.");
  }
});

// Delete blog
router.post("/blogs/:id/delete", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Failed to delete blog.");
  }
});


//Authentication Pages
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.get("/register", (req, res) => {
  res.render("register.ejs");
});
// Register request
router.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  
  if (!email || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const existing = await Users.findOne({email});
  if(existing) return res.send("User already exists!")

  const user = new Users({name, email, password});
  await user.save();
  res.redirect("/login");
});

// Login request
router.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try{
    const result = await Users.findOne({email});
      if(result){
        const storePass = result.password;
        if( storePass === password){
          res.redirect("/");
        }else{
          res.send("Incorrect Password!");
        }
      }else{
        res.send("User Not Found!");
      }
  } catch(err){
    console.log(err);
  }
});
export default router;
