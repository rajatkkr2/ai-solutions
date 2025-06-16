const express = require("express");
const router = express.Router();
const { loginAdmin, signUp } = require("../controllers/authController");

router.post("/login", loginAdmin);
router.post('/signup', signUp);

module.exports = router;
