const axios = require('axios');
require('dotenv').config();
const enc = require('../utility/crypto');

/**
 * Extracts the first JSON object from a string
 * Returns null if no valid JSON found
 */
function extractJSON(text) {
  // Remove markdown code block ```json ... ```
  const codeBlockMatch = text.match(/```json([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // If no code block, fallback to grabbing {...}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return text.substring(start, end + 1);
}

const classifyTicket = async (title, description) => {
  const url = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-12-01-preview`;
  const prompt = `
You are a support ticket classifier.
ONLY respond with a single valid JSON object EXACTLY in this format, without any explanation or extra text:

{
  "priority": "low" | "medium" | "high" | "critical",
  "assigned_team": "Billing" | "Technical Support" | "Sales" | "General",
  "tags": [list of 2 to 4 relevant tags]
}

Ticket Title: ${title}
Ticket Description: ${description}
`;

  try {
    const response = await axios.post(
      url,
      {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      },
      {
        headers: {
          'api-key': enc.decrypt(process.env.AZURE_OPENAI_KEY),
          'Content-Type': 'application/json',
        },
      }
    );

    const message = response.data.choices[0].message.content;

    // Extract JSON part safely
    const rawJson = extractJSON(message);
    if (!rawJson) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(rawJson);

    return {
      ...parsed,
      confidence: 0.95,
    };
  } catch (error) {
    console.error('Azure OpenAI error or JSON parse failure:', error.message || error);
    return {
      priority: 'medium',
      assigned_team: 'General',
      tags: [],
      confidence: 0.5,
    };
  }
};

module.exports = classifyTicket;
