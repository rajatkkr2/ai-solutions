const express = require('express');
const router = express.Router();
const  faqBotController  = require('../controllers/smartFaqBotController');

router.post('/', faqBotController.askQuestion);

module.exports = router;