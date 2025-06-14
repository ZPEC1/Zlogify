# 🌐 Zlogify — Integrating vlog trends with boring blogs to make the beauty of text come to life.

**Zlogify** is a modern publishing platform that merges blogging and vlogging into a seamless user experience. Designed for creators, educators, and storytellers, it allows users to publish beautifully styled blogs and video-based content with ease — all from a single interface.

---

## 🔍 Overview

Zlogify enables users to:

- 📖 Create and publish rich-text blogs with custom formatting.
- 🎥 Share vlogs through video uploads or embedded links.
- 🏷️ Organize and browse content via categories and tags.
- 🔐 Securely manage their posts through login-based access.
- 🎨 Customize content appearance using a WYSIWYG editor.

Whether it's a personal journal, educational vlog, or multi-format media project — Zlogify makes content creation more flexible and powerful.

---

## ✨ Core Features

### ✅ Unified Publishing
- Easily toggle between text and video content.
- Auto-generate clean blog previews with video thumbnails and lazy-loaded embeds.

### ✅ Advanced Blog Styling
- Use a built-in rich text editor to format blog content.
- Customize fonts, colors, alignment, and embed images or videos directly.

### ✅ Dynamic Filtering
- Filter posts by categories, tags, or content type.
- Responsive grid layout optimized for both text-heavy and video-rich content.

### ✅ Content Security
- Posts are editable only by their creators.
- Server-side sanitization to protect against malicious content injections.

---

## 🚀 Getting Started

### 🔧 Requirements
- Node.js and npm
- MongoDB (local or cloud)
- Supabase account for handling video uploads

---

### 📦 Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/zlogify.git
   cd zlogify
   ```

2. **Install backend dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory with the following:

   ```env
   MONGODB_URI=your_mongo_uri
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SESSION_SECRET=your_custom_secret
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Access the app:**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔮 Future Improvements

Zlogify is built with extensibility in mind. Upcoming features aim to enhance both the content creation process and the viewer experience:

- 🤖 **AI-Powered Blog Generation**  
  Automatically generate blog posts from uploaded videos using advanced transcription and summarization pipelines.

- 🧠 **Intelligent Recommendations**  
  Personalized content suggestions based on user interests, reading habits, and categories.

- 💬 **Commenting & Reactions**  
  Enable richer engagement with post-specific comment threads and reaction icons.
---

Zlogify isn't just another blog tool — it’s a publishing ecosystem designed to adapt to the evolving ways people create and consume content.

**Start with Zlogify today.**
