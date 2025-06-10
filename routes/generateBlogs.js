import express from "express";
import multer from "multer";
import supabase from "../supabase.js";
import Blog from "../models/blogs.js";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateFakeBlogContent(videoUrl, titleInput) {
  const title = titleInput || "Auto-Generated Blog Title";
  const content = `
    <p>This blog was auto-generated from your uploaded video.</p>
    <iframe width="100%" height="400" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
    <p>More content can be added here by the AI later...</p>
  `;
  return { title, content };
}
router.post("/temp", upload.single("video"), async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const user = req.user;

    const filename = `public/${Date.now()}-${originalname}`;
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filename, buffer, { contentType: mimetype });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicData } = supabase.storage
      .from("videos")
      .getPublicUrl(data.path);

    const publicURL = publicData.publicUrl;

    const { title, content } = generateFakeBlogContent(
      publicURL,
      req.body.title
    );

    req.session.tempBlog = {
      title,
      content,
      videoUrl: publicURL,
      createdAt: new Date(),
    };

    console.log("Temp blog set:", req.session.tempBlog);

    res.redirect("/generate-blog/preview");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during temporary blog generation");
  }
});

router.get("/preview", (req, res) => {
  const tempBlog = req.session.tempBlog;

  if (!tempBlog) {
    return res.status(400).send("No temporary blog data found.");
  }
  res.render("previewBlog", { blog: tempBlog, activePage: "home" });
});
router.post("/finalize", async (req, res) => {
  try {
    const user = req.user;
    const { title, content, category } = req.body;

    const tempBlog = req.session.tempBlog;
    if (!tempBlog) {
      return res.status(400).send("No temporary blog data found.");
    }
    console.log("Temp blog session read:", req.session.tempBlog);
    const newBlog = new Blog({
      title,
      content,
      author: user.name,
      email: user.email,
      createdAt: new Date(),
      hasVideo: true,
      videoUrl: tempBlog.videoUrl,
      category
    });

    await newBlog.save();

    // Important: Clean up temp session
    delete req.session.tempBlog;

    res.redirect(`/blogs/${newBlog._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finalizing blog");
  }
});

export default router;
