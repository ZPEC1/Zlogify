import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  username: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  content: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
  hasVideo: { type: Boolean, default: false }, 
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
