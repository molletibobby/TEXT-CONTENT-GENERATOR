const express = require('express');
const mediaController = require('../controllers/media.controller');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Multimodal Upload Route (Multer single file upload field 'file')
router.post('/upload', upload.single('file'), mediaController.processMediaUpload);

// AI Custom Generation Route
router.post('/generate', mediaController.generateCustomContent);

// Upload History Routes
router.get('/history', mediaController.getHistory);
router.delete('/history/:id', mediaController.deleteJob);

module.exports = router;
