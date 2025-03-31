import express from "express";
import fs from "fs";

const router = express.Router();
const blogs = [
  { title: "Tech Trends 2025", content: "AI and quantum computing are evolving...", category: "Technology" },
  { title: "Literature in Modern Times", content: "Authors today focus on deep storytelling...", category: "Literature" },
  { title: "The Future of Politics", content: "Global policies are shifting towards...", category: "Politics" }
];
router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
router.get("/blogs", (req, res) => {
  const category = req.query.category || "All";
  const filteredBlogs = category === "All" ? blogs : blogs.filter(blog => blog.category.toLowerCase() === category.toLowerCase());
  
  res.render("blogs", { category, blogs: filteredBlogs });
});


export default router;