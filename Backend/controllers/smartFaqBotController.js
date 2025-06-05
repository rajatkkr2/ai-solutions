const smartFaqBotService = require('../services/faqBotService');

exports.askQuestion = async (req, res) => {
  const { message } = req.body;

  try {
    const reply = await smartFaqBotService.getBotReply(message);
    res.json({ reply });
  } catch (error) {
    console.error('FAQ Bot Error:', error.message);
    res.status(500).send('Error processing the request');
  }
};