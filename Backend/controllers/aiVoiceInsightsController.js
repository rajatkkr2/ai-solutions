const aiVoiceInsightsService = require('../services/aiVoiceInsightsService');
const VoiceInsights = require('../models/VoiceInsights');

exports.processAudio = async (req, res) => {
  try {
    console.log('📥 Upload started');
    const filePath = req.file.path;
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const transcript = await aiVoiceInsightsService.transcribeAudio(filePath);
    console.log('✅ Transcript obtained');

    const analysis = await aiVoiceInsightsService.analyzeText(transcript);
    console.log('✅ Text analyzed');

    const finaltext = aiVoiceInsightsService.parseAnalysisToJSON(analysis);
    console.log('✅ Final analysis parsed');

    const insight = new VoiceInsights({
      email,
      transcript,
      finaltext,
      filePath,
      type: 'audioFile'
    });

    await insight.save();
    console.log('✅ Insight saved to DB', insight);

    res.json({ transcript, finaltext });
  } catch (err) {
    console.error('❌ Error in processing:', err.message);
    res.status(500).send('Error processing audio');
  }
};


exports.processTranscript = async (req, res) => {
  try {
    const {username, transcript, type} = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    if(!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const analysis = await aiVoiceInsightsService.analyzeText(transcript);

    const finaltext = aiVoiceInsightsService.parseAnalysisToJSON(analysis);

    const insight = new VoiceInsights({
      email:username,
      transcript,
      finaltext,
      type
    });

    await insight.save();
    console.log('✅ Insight saved to DB', insight);

    res.json({ transcript, finaltext });
  } catch (err) {
    console.error('❌ Error in processing:', err.message);
    res.status(500).send('Error processing audio');
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const insights = await VoiceInsights.find({ email }).sort({ createdAt: -1 });
    if (insights.length === 0) {
      return res.status(404).json({ error: 'No insights found for this email' });
    }
    res.json(insights);
  } catch (err) {
    console.error('❌ Error fetching summary:', err.message);
    res.status(500).send('Error fetching summary');
  }
}
    