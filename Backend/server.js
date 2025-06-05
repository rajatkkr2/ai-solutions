const express = require('express'); 
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');
const aiVoiceInsightsRoutes = require('./routes/aiVoiceInsightsRoutes');
const smartFaqBotRoutes = require('./routes/smartFaqBotRoutes');
const cors = require('cors');
require('dotenv').config();


const app = express();

connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use('/tickets', ticketRoutes);
app.use('/voice', aiVoiceInsightsRoutes);
app.use('/ask', smartFaqBotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));