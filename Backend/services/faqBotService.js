const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const enc = require("../utility/crypto");

const faqText = fs.readFileSync('./utility/faq.txt', 'utf-8');
const faqData = JSON.parse(fs.readFileSync('./utility/faq.json', 'utf-8'));

exports.getBotReply = async (message, email, history = [], memory = {}) => {
  if (!message) {
    return "Please provide a message to get an answer.";
  }

  // Load FAQ content
  const faqFormatted = faqData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');

  // Combine memory facts if available
  const memoryContext = Object.entries(memory).map(([k, v]) => `${k}: ${v}`).join('\n');

  // Construct the initial system prompt
  const systemPrompt = `
You are a highly intelligent, empathetic customer support assistant.
You are answering questions based only on the FAQ content below.

When the user shares personal info like their favorite color or preferences, remember them for later use.
Use the stored memory and chat history to give natural, helpful, and contextual responses.

FAQ Content:
${faqFormatted}

User Memory:
${memoryContext}
  `;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,  // All past messages from user and assistant
    { role: 'user', content: message } // current user message
  ];

  const url = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-12-01-preview`;

  try {
    const response = await axios.post(
      url,
      {
        messages,
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'api-key': enc.decrypt(process.env.AZURE_OPENAI_KEY),
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0]?.message?.content?.trim();
    if (!reply) return "Sorry, I couldn't understand that.";

    // Return updated reply and store it in history
    return {
      reply: reply.replace(/\n/g, "<br>"),
      newMessage: { role: 'assistant', content: reply }
    };
  } catch (error) {
    console.error('Azure OpenAI error:', error?.response?.data || error.message);
    throw new Error('Failed to get response from Azure OpenAI');
  }
};

