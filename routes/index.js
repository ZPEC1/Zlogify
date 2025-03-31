import express from "express";

const router = express.Router();

// Fix: Each blog has a unique ID
const blogs = [
  { id: "1", title: "Tech Trends 2025", content: "AI and quantum computing are evolving...", category: "Technology" },
  { id: "2", title: "Literature in Modern Times", content: "Authors today focus on deep storytelling...", category: "Literature" },
  { id: "3", title: "The Future of Politics", content: "Global policies are shifting towards...", category: "Politics" }
];

router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

router.get("/blogs", (req, res) => {
  const category = req.query.category || "All";
  const filteredBlogs = category === "All" ? blogs : blogs.filter(blog => blog.category.toLowerCase() === category.toLowerCase());

  res.render("blogs", { category, blogs: filteredBlogs });
});

router.get("/blogs/:id", (req, res) => {
  const blog = blogs.find(blog => blog.id === req.params.id); // Fix: Correct find method
  if (!blog) {
    return res.status(404).send("Blog not found");
  }
  
  res.render("blogDetails", { blog });
});

router.get("/post", (req, res) => {
  res.render("post");
})

router.post("/blogs", (req, res) => {
  const { email, name, title, category, content } = req.body;

  if (!email || !name || !title || !category || !content) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newBlog = {
    id: String(blogs.length + 1), // Simple ID generation
    title,
    content,
    category,
    author: name,
    email,
  };

  blogs.push(newBlog);
  res.json(newBlog);
});

export default router;
