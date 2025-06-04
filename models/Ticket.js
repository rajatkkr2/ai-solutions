const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  customer_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  assigned_team: { type: String },
  classified_by_ai: { type: Boolean, default: false },
  ai_confidence: { type: Number, default: 0 },
  tags: [String]
});

module.exports = mongoose.model('Ticket', TicketSchema);
