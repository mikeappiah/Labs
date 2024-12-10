const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../', 'public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `product-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext !== '.png' &&
      ext !== '.jpg' &&
      ext !== '.jpeg' &&
      ext !== '.gif' &&
      ext !== '.webp'
    ) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

module.exports = upload;
