const express = require('express');
const router = express.Router();

const { createTicket, getAllTickets } = require('../controllers/ticketController');

router.post('/', createTicket);
router.post('/getAllTickets', getAllTickets);

module.exports = router;
