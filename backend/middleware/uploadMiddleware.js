import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage as cloudinaryStorage } from '../config/cloudinary.js';

let storage;
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  storage = cloudinaryStorage;
  console.log('Multer: Configured with Cloudinary storage.');
} else {
  // Local fallback setup
  const uploadDir = './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
  console.log('Multer: Cloudinary credentials missing. Falling back to local disk storage.');
}

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, webp)!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

export default upload;
