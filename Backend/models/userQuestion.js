const mongoose = require("mongoose");

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  user_email: { type: String, default : "test@admin.com"},
  feedback: {
    type: String,
    enum: ["positive", "negative", "none"],
    default: "none"
  },
  flagged: {
    type: Boolean,
    default: false
  }

},{ timestamps: true }); 

module.exports = mongoose.model("Faq", FaqSchema);
