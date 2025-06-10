import express from "express";
import Blog from "../models/blogs.js";
import Users from "../models/Users.js";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
//sanitise 
import sanitizeHtml from 'sanitize-html';
//Hashing using Bcrypt == Blowfish Cipher == Industry Standard
import bcrypt from "bcrypt";
const router = express.Router();
//Salting for more security 
const saltRounds = 14;

//sessions
router.use(session({
  secret: "TopSecretWord",
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge: 10000*60*60*24,
    httpOnly: true,             
    secure: false,              
    sameSite: "lax",   
  }
}));
//passport
router.use(passport.initialize());
router.use(passport.session());
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


//supabase
import uploadRoute from './upload.js'; 
router.use('/upload', uploadRoute);
import generateBlogRoute from'./generateBlogs.js';
router.use('/generate-blog', generateBlogRoute);


// Home Page
router.get("/", (req, res) => {
  res.render("index", { title: "Home", activePage: "home" });
});

// Blog Listing
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
//My Blogs/Posts page
router.get("/myPosts", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  try {
    const userBlogs = await Blog.find({ email: req.user.email }).sort({ createdAt: -1 });

    res.render("myPosts", { userBlogs,  activePage: "myPosts"});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading posts");
  }
});

// Blog Details
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    res.render("blogDetails", { blog, activePage: "home" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching blog");
  }
});


// Handle New Blog Post
router.get("/post", (req, res) => {
  if(!req.isAuthenticated()){
    return res.redirect("/login");
  }
  res.render("post", { user: req.user, activePage: "create" });
});
router.post("/blogs", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  const { email, name, title, category, content } = req.body;

  if (!email || !name || !title || !category || !content) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Simple check for iframe/video embed in content (case-insensitive)
  const hasVideo = /<iframe.*src=.*(youtube\.com|vimeo\.com).*>.*<\/iframe>/i.test(content);

  try {
    const newBlog = new Blog({
      title,
      content,
      category,
      author: name,
      email,
      hasVideo, // set the flag
    });

    await newBlog.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving blog post");
  }
});
/// Edit blog page
router.get("/blogs/:id/edit", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (!req.isAuthenticated() || req.user.email !== blog.email) {
      return res.status(403).send("Unauthorized access");
    }

    res.render("editBlog", { blog, activePage: "create" });
  } catch (err) {
    res.status(500).send("Error loading blog for editing");
  }
});
router.post("/blogs/:id/edit", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (!req.isAuthenticated() || req.user.email !== blog.email) {
      return res.status(403).send("Unauthorized");
    }

    const { title, name, email, category, content } = req.body;

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
//Delete blog page
router.post("/blogs/:id/delete", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (!req.isAuthenticated() || req.user.email !== blog.email) {
      return res.status(403).send("Unauthorized");
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Failed to delete blog.");
  }
});
// Utility function to detect video iframe presence in HTML content
function hasVideoEmbed(htmlContent) {
  return /<iframe.*src=.*(youtube\.com|vimeo\.com).*>.*<\/iframe>/i.test(htmlContent);
}

// Advanced Options for Post - create with advanced
router.post("/blogs/advanced", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const videoPresent = hasVideoEmbed(content);

    const blog = new Blog({
      email: req.user.email,
      author: req.user.name,  // changed from 'name' to 'author' for consistency with your other code
      title,
      content,
      category,
      hasVideo: videoPresent,  // set the flag here
    });
    await blog.save();
    res.redirect(`/blogs/${blog._id}/advanced`);
  } catch (err) {
    res.status(500).send("Failed to save blog for advanced options.");
  }
});

router.get("/blogs/:id/advanced", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");
    if (!req.isAuthenticated() || req.user.email !== blog.email) {
      return res.status(403).send("Unauthorized");
    }

    res.render("advancedEditor", { user: req.user, blog, activePage: "create" });
  } catch (err) {
    res.status(500).send("Failed to load advanced editor.");
  }
});

router.post("/blogs/:id/advanced/save", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    if (!req.isAuthenticated() || req.user.email !== blog.email) {
      return res.status(403).send("Unauthorized");
    }

    const cleanHTML = sanitizeHtml(req.body.styledContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
      allowedAttributes: {
        '*': ['style', 'class'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
        img: ['src', 'alt'],
        a: ['href', 'target', 'rel'],
      },
      allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
    });

    blog.content = cleanHTML;
    blog.hasVideo = hasVideoEmbed(cleanHTML);  // update flag on save
    await blog.save();

    res.redirect(`/blogs/${blog._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to save styled blog content.");
  }
});


//vlogs
router.get("/vlogs", async (req, res) => {
  try {
    const vlogs = await Blog.find({ hasVideo: true }).sort({ createdAt: -1 });
    res.render("vlogs", { vlogs, activePage: "vlogs" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load vlogs.");
  }
});

//vlogs upload
router.get("/upload-video", (req, res) => {
  if(!req.isAuthenticated()){
    return res.redirect("/login");
  }
  res.render("uploadVideo", { user: req.user, activePage: "Upload Video" });
});


//Authentication Pages
router.get("/login", (req, res) => {
  res.render("login.ejs", { activePage: "login" });
});

router.get("/register", (req, res) => {
  res.render("register.ejs", { activePage: "register" });
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
  if(existing) return res.send("User already exists!");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.send(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );
  }
  //Password Hashing
  bcrypt.hash(password, saltRounds, async (err, hash)=>{
    if(err){console.log("Hashing Error!");}
    else{const user = new Users({name, email, password:hash});
      await user.save();
      res.redirect("/login");}
  });
});

// Login request
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).send("Invalid username or password");

      req.login(user, (err) => {
        if (err) return next(err);
        req.session.userId = user._id;
        req.session.name = user.name;
        req.session.email = user.email;

        return res.redirect("/");
      });
    })(req, res, next);
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Something went wrong. Please try again.");
  }
});


passport.use(new Strategy({ usernameField: 'username' }, async function (username, password, cb) {
  try {
    const user = await Users.findOne({ email: username });

    if (!user) {
      return cb(null, false, { message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return cb(null, user);
    } else {
      return cb(null, false, { message: "Incorrect password" });
    }
  } catch (err) {
    console.error("Error in passport strategy:", err);
    return cb(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

//logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed.");
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});

export default router;
function sanitise() {
  return require("sanitize-html");
}

