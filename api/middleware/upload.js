const multer = require('multer');

const storage = multer.memoryStorage();

// 200MB total request limit (images + video + document)
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  const mimetype = file.mimetype || '';
  if (field === 'images') {
    if (!mimetype.startsWith('image/')) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'images'));
  } else if (field === 'video') {
    if (!mimetype.startsWith('video/')) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'video'));
  } else if (field === 'document') {
    const allowed = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]);
    if (!allowed.has(mimetype)) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'document'));
  } // other fields not expected
  cb(null, true);
};

const upload = multer({ storage, limits: { fileSize: MAX_TOTAL_BYTES }, fileFilter });

module.exports = upload;
