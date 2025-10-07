const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

// Try Cloudinary first, fallback to local storage if credentials are missing
const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'civicmitra',
        allowed_formats: ['jpeg', 'png', 'jpg', 'pdf', 'mp4'],
      },
    });
    console.log('✅ Using Cloudinary storage');
  } catch (error) {
    console.error('❌ Cloudinary initialization failed:', error.message);
    console.log('⚠️  Falling back to local storage');
    hasCloudinaryConfig = false;
  }
}

if (!hasCloudinaryConfig) {
  // Local disk storage fallback
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${base}_${timestamp}${ext}`);
    },
  });
  console.log('✅ Using local disk storage at:', uploadsDir);
}

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'video/mp4'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

const upload = multer({ storage: storage, fileFilter });

module.exports = upload;