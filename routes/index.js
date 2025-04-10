import express from "express";
import Blog from "../models/blogs.js"; // make sure the path matches your structure

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

export default router;
