const express = require("express");
const router = express.Router();
const { getAllFAQs, exportCSV, flagFaq } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

router.post("/all",  getAllFAQs);
router.post("/export",  exportCSV);
router.post("/flag/:id",  flagFaq);

module.exports = router;