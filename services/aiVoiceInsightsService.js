const axios = require("axios");
const fs = require("fs");
const enc = require("../utility/crypto");
require("dotenv").config(); // Load environment variables

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
//const AZURE_OPENAI_KEY = enc.encrypt(process.env.AZURE_OPENAI_KEY);
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-12-01-preview`;

// 🎤 Step 1: Transcribe with AssemblyAI
async function transcribeAudio(filePath) {
  const uploadRes = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    fs.createReadStream(filePath),
    {
      headers: { authorization: ASSEMBLYAI_API_KEY },
    }
  );

  const audio_url = uploadRes.data.upload_url;

  const transcriptRes = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    { audio_url },
    { headers: { authorization: ASSEMBLYAI_API_KEY } }
  );

  const transcriptId = transcriptRes.data.id;

  let status = "queued";
  while (status !== "completed") {
    const poll = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers: { authorization: ASSEMBLYAI_API_KEY } }
    );

    status = poll.data.status;
    if (status === "completed") {
      return poll.data.text;
    } else if (status === "error") {
      throw new Error("Transcription failed");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

// 🤖 Step 2: Analyze text with Azure OpenAI
async function analyzeText(text) {
  try{
  const prompt = `
You are an AI call center assistant.

Here's a customer service call transcript:

"${text}"

Please provide:
- A short summary
- Sentiment (Positive, Neutral, Negative)
- Key topics mentioned
- solution
- Customer stisfaction rating (1-5)
- Customer feedback
- Customer's intent
- Customer's pain points
Format your response as follows:
**Summary:** [Your summary here]
**Sentiment:** [Positive/Neutral/Negative]
**Key topics mentioned:**
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]
**Solution:** [Your solution here]
**Customer satisfaction rating:** [1-5]
**Customer feedback:** [Your feedback here]
**Customer's intent:** [Your analysis here]
**Customer's pain points:** [Your analysis here]
`;

  const response = await axios.post(
    url,

    {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        "api-key": enc.decrypt(process.env.AZURE_OPENAI_KEY),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
} catch (error) {
  console.error("Error analyzing text:", error);
  throw new Error("Text analysis failed");
  }
}

// 🧠 Step 3: Parse AI response
function parseAnalysisToJSON(analysisText) {
  const summaryMatch = analysisText.match(/\*\*Summary:\*\*\s*(.*?)\n/i);
  const sentimentMatch = analysisText.match(/\*\*Sentiment:\*\*\s*(.*?)\n/i);
  const topicsMatch = analysisText.match(/\*\*Key topics mentioned:\*\*\s*((?:.|\n)*)/i);

  const summary = summaryMatch ? summaryMatch[1].trim() : null;
  const sentiment = sentimentMatch ? sentimentMatch[1].trim() : null;
  const topics = topicsMatch
    ? topicsMatch[1]
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
    : [];

  return {
    summary,
    sentiment,
    keyTopics: topics,
  };
}


module.exports = { transcribeAudio, analyzeText, parseAnalysisToJSON };
