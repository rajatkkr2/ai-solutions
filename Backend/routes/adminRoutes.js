const express = require("express");
const router = express.Router();
const { getAllFAQs, exportCSV, flagFaq } = require("../controllers/adminController");
const faqController = require("../controllers/faqtxtController");
const { protect } = require("../middleware/authMiddleware");

router.post("/all",  getAllFAQs);
router.post("/export",  exportCSV);
router.post("/flag/:id",  flagFaq);

//for edit faqs
router.get('/', faqController.getAllFaqs);
router.get('/:id', faqController.getFaqById);
router.post('/', faqController.addFaq);
router.put('/:id', faqController.updateFaq);
router.delete('/:id', faqController.deleteFaq);

module.exports = router;