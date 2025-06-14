const express = require('express');
const router = express.Router();
const  faqBotController  = require('../controllers/smartFaqBotController');

router.post('/', faqBotController.askQuestion);
router.post("/feedback/:id", faqBotController.giveFeedback); 
router.post("/all", faqBotController.getFaqsbyemail);

module.exports = router;