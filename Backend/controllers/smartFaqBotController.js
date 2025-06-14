const smartFaqBotService = require('../services/faqBotService');
const Faq = require('../models/userQuestion');
const mongoose = require("mongoose");

exports.askQuestion = async (req, res) => {
  const { message, email } = req.body;

  try {
    const reply = await smartFaqBotService.getBotReply(message);
   
    const saved = await Faq.create({ question: message, answer:reply, user_email:email });
    res.json({ reply, id: saved._id });
  } catch (error) {
    console.error('FAQ Bot Error:', error.message);
    res.status(500).send('Error processing the request');
  }
};

exports.giveFeedback = async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  if (!["positive", "negative"].includes(feedback)) {
    return res.status(400).json({ error: "Invalid feedback value" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid FAQ ID" });
  }

  try {
    const updated = await Faq.findByIdAndUpdate(id, { feedback }, { new: true });
    if (!updated) return res.status(404).json({ error: "FAQ not found" });

    res.json({ message: "Feedback updated", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update feedback" });
  }
};

exports.getFaqsbyemail = async (req, res) => {
  try {
    let email = req?.body?.email;
    let query = email ? { user_email: email } : {};
    const faqs = await Faq.find(query).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};