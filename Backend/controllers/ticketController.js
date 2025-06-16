const Ticket = require('../models/Ticket');
const classifyTicket = require('../services/ticketAiService.js');

const createTicket = async (req, res) => {
  try {
    console.log('Received request to create ticket:');
    const { title, description, customer_email } = req.body;

    if (!title || !description || !customer_email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Call AI classifier
    const aiResponse = await classifyTicket(title, description);

    const ticket = new Ticket({
      title,
      description,
      customer_email,
      assigned_team: aiResponse.assigned_team,
      priority: aiResponse.priority,
      tags: aiResponse.tags,
      ai_confidence: aiResponse.confidence,
      classified_by_ai: true,
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function getAllTickets(req, res) {
  Ticket.find()
    .then(tickets => res.status(200).json(tickets))
    .catch(err => {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ message: 'Server error' });
    });
}

module.exports = {
  createTicket, getAllTickets
};
