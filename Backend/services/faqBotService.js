const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const enc = require("../utility/crypto");

const faqText = fs.readFileSync('./utility/faq.txt', 'utf-8');

exports.getBotReply = async (message) => {
  if (!message) {
    return "Please provide a message to get an answer.";
  }

  const prompt = `
You are a highly intelligent, professional customer support assistant with expert knowledge based on the FAQ content below. Your goal is to provide accurate, thorough, and impressively clear answers to customers' questions.

Guidelines for your responses:
- Use the FAQ content as your only knowledge source; do not invent answers beyond it.
- Provide direct, confident, and helpful answers with detailed explanations when needed.
- Communicate with empathy, patience, and professionalism.
- When appropriate, offer additional tips or related info that benefits the customer.
- Keep answers concise yet comprehensive; avoid unnecessary repetition.
- If the user’s question is ambiguous or outside the FAQ scope, ask politely for clarification or suggest next steps.
- Format your response for easy reading and clarity.
- Always maintain a positive, friendly tone that builds customer trust.

FAQ Content:
${faqText}

User question: ${message}

Answer:
`;

 const url = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-12-01-preview`;
  try {
    const response = await axios.post(
      url,
      {
        messages: [
          { role: 'system', content: 'You are a helpful support assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        stop: ['User question:', 'Answer:']
      },
      {
        headers: {
          'api-key': enc.decrypt(process.env.AZURE_OPENAI_KEY),
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim().replace(/\n/g, '<br>');
    } else {
      return "Sorry, I didn't get a valid response.";
    }
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error?.response?.data || error.message);
    throw new Error('Failed to get response from Azure OpenAI');
  }
};
