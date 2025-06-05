const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiVoiceInsightsController = require('../controllers/aiVoiceInsightsController');

const upload = multer({ dest: 'uploads/' });

// Route to handle audio upload and analysis
router.post('/', upload.single('audio'), aiVoiceInsightsController.processAudio);

module.exports = router;
