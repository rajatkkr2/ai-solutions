// controllers/adminController.js
const Faq = require("../models/userQuestion");
const { generateCSV } = require("../services/csvService");

exports.getAllFAQs = async (req, res) => {
  const faqs = await Faq.find().sort({ createdAt: -1 });
  res.json(faqs);
};

exports.exportCSV = async (req, res) => {
  const faqs = await Faq.find();
  const csv = generateCSV(faqs);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=faq-data.csv");
  res.send(csv);
};

exports.flagFaq = async (req, res) => {
  let flagged = req.body.flagged;
  const faq = await Faq.findByIdAndUpdate(req.params.id, { flagged: flagged }, { new: true });
  res.json(faq);
};
