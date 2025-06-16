const Admin = require('../models/Admin');
const jwt = require("jsonwebtoken");
const authService = require('../services/signUp');


exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ token,username });
};

exports.signUp = async (req, res) => {
  try {
    const user = await authService.signUp(req.body);
    res.status(201).json({ success:true, user });
  } catch (err) {
    res.status(400).json({ success:false, error: err.message });
  }
}
