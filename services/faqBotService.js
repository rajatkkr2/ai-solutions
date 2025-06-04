const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const faqText = fs.readFileSync('./utility/faq.txt', 'utf-8');

exports.getBotReply = async (message) => {
  if(!message){
    return "Please provide a Message to get an answer.";
  }
  const prompt = `You are a helpful support assistant. Use the following FAQ content to answer customer questions:\n\n${faqText}\n\nUser question: ${message}\nAnswer:`;

  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: MODEL,
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7,
        stop: ['User question:', 'Answer:']
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    if (data.output) {
      if (typeof data.output === 'string') {
        return data.output.trim();
      } else {
        let rawText = JSON.stringify(data.output.choices[0]?.text);
        return rawText
          .replace(/^"|"$/g, '')
          .replace(/\r/g, '')
          .replace('\n\n', '')
          .replace(/\n/g, '<br>')
          .trim();
      }
    } else {
      return "Sorry, I didn't get a valid response.";
    }
  } catch (error) {
    console.error('Error calling Together AI:', error?.response?.data || error.message);
    throw new Error('Failed to get response from Together AI');
  }
};
