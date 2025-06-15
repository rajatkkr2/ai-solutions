const faqService = require('../services/faqtxtServices');

exports.getAllFaqs = (req, res) => {
  const faqs = faqService.getAll();
  res.json(faqs);
};

exports.getFaqById = (req, res) => {
  const faq = faqService.getById(req.params.id);
  if (faq) {
    res.json(faq);
  } else {
    res.status(404).json({ message: 'FAQ not found' });
  }
};

exports.addFaq = (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer are required.' });
  }

  const newFaq = { question, answer };
  const result = faqService.add(newFaq);
  res.status(201).json(result);
};

exports.updateFaq = (req, res) => {
  const { question, answer } = req.body;
  const updated = faqService.update(req.params.id, { question, answer });

  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ message: 'FAQ not found' });
  }
};

exports.deleteFaq = (req, res) => {
  const deleted = faqService.remove(req.params.id);
  if (deleted) {
    res.json({ message: 'FAQ deleted successfully' });
  } else {
    res.status(404).json({ message: 'FAQ not found' });
  }
};
