const mongoose = require('mongoose');

const VoiceInsightsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  transcript: { type: String, required: true },
  finaltext: { type: mongoose.Schema.Types.Mixed, required: true }, // Can hold JSON
  filePath: { type: String },
  type:{ type: String, default: 'audioFile' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoiceInsights', VoiceInsightsSchema);
