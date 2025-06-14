const express = require('express'); 
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');
const aiVoiceInsightsRoutes = require('./routes/aiVoiceInsightsRoutes');
const smartFaqBotRoutes = require('./routes/smartFaqBotRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes')
const cors = require('cors');
require('dotenv').config();


const app = express();

connectDB();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/voice', aiVoiceInsightsRoutes);
app.use('/api/ask', smartFaqBotRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));