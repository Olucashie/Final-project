const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/hostelController');

router.get('/', auth, ctrl.getAll);
router.get('/search', auth, ctrl.search);
router.get('/:id', auth, ctrl.getById);
// Enable multipart uploads for multiple images, optional video and document
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'images', maxCount: 50 },
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ]),
  ctrl.create
);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

// Admin approve/unapprove
router.post('/:id/verify', auth, ctrl.verify);
router.post('/:id/unverify', auth, ctrl.unverify);

module.exports = router;
