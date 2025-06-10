import express from 'express';
import multer from 'multer';
import supabase from '../supabase.js';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;

    const { data, error } = await supabase.storage
      .from('videos') // Bucket name must be created manually
      .upload(`public/${Date.now()}-${originalname}`, buffer, {
        contentType: mimetype,
      });

    if (error) return res.status(500).json({ error: error.message });

    const { publicURL } = supabase.storage.from('videos').getPublicUrl(data.path);
    res.status(200).json({ url: publicURL });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
