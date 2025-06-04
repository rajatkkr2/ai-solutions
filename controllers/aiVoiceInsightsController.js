const aiVoiceInsightsService = require('../services/aiVoiceInsightsService');

exports.processAudio = async (req, res) => {
  try {
    console.log('📥 Upload started');
    const filePath = req.file.path;

    const transcript = await aiVoiceInsightsService.transcribeAudio(filePath);
    //const transcript = `Hello this side Richard actually I'm calling you regarding my ac. My AC is not working properly so can you help me to get solutions on like send an engineer at my home who can check my ac. Hi sir, this is Subin from Samsung acs. How can help you? I think we can provide you an engineer that help you for your AC checkup and if and that that service is paidable. Hope you satisfied with my points. Yes I'm satisfied with your point. Or please send an engineer who can check my AC and resolve my solutions. Thank you so much. So.`
    console.log('✅ Transcript obtained');

    const analysis = await aiVoiceInsightsService.analyzeText(transcript);
    console.log('✅ Text analyzed');

    const finaltext = aiVoiceInsightsService.parseAnalysisToJSON(analysis);
    console.log('✅ Final analysis parsed');

    res.json({ transcript, finaltext });
  } catch (err) {
    console.error('❌ Error in processing:', err.message);
    res.status(500).send('Error processing audio');
  }
};
