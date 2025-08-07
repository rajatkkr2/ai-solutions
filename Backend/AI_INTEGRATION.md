# AI Integration Architecture

## Overview

The Smart Ticket Routing System integrates multiple AI services to provide intelligent automation for customer support operations. The system uses **Azure OpenAI** for text analysis and **AssemblyAI** for audio transcription, creating a comprehensive AI-powered support platform.

## AI Services Architecture

### 1. **Azure OpenAI Integration**

#### Configuration
```javascript
// Environment Variables
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_KEY=encrypted_api_key
```

#### Service Implementation
```javascript
// ticketAiService.js - Ticket Classification
const classifyTicket = async (title, description) => {
  const url = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-12-01-preview`;
  
  const prompt = `
You are a support ticket classifier.
ONLY respond with a single valid JSON object EXACTLY in this format:

{
  "priority": "low" | "medium" | "high" | "critical",
  "assigned_team": "Billing" | "Technical Support" | "Sales" | "General",
  "tags": [list of 2 to 4 relevant tags]
}

Ticket Title: ${title}
Ticket Description: ${description}
`;

  const response = await axios.post(url, {
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  }, {
    headers: {
      'api-key': enc.decrypt(process.env.AZURE_OPENAI_KEY),
      'Content-Type': 'application/json',
    },
  });

  return parseAIResponse(response.data.choices[0].message.content);
};
```

#### AI Response Processing
```javascript
// Extract JSON from AI response
function extractJSON(text) {
  const codeBlockMatch = text.match(/```json([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return text.substring(start, end + 1);
}
```

### 2. **AssemblyAI Integration**

#### Audio Transcription Service
```javascript
// aiVoiceInsightsService.js - Audio Processing
async function transcribeAudio(filePath) {
  // Step 1: Upload audio file
  const uploadRes = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    fs.createReadStream(filePath),
    {
      headers: { authorization: ASSEMBLYAI_API_KEY },
    }
  );

  const audio_url = uploadRes.data.upload_url;

  // Step 2: Start transcription
  const transcriptRes = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    { audio_url },
    { headers: { authorization: ASSEMBLYAI_API_KEY } }
  );

  const transcriptId = transcriptRes.data.id;

  // Step 3: Poll for completion
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
```

### 3. **Voice Analysis with Azure OpenAI**

#### Text Analysis Service
```javascript
async function analyzeText(text) {
  const prompt = `
You are an AI call center assistant.

Here's a customer service call transcript:

"${text}"

Please provide:
- A short summary
- Sentiment (Positive, Neutral, Negative)
- Key topics mentioned
- Solution
- Customer satisfaction rating (1-5)
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

  const response = await axios.post(url, {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  }, {
    headers: {
      "api-key": enc.decrypt(process.env.AZURE_OPENAI_KEY),
      "Content-Type": "application/json",
    },
  });

  return response.data.choices[0].message.content;
}
```

### 4. **FAQ Bot Service**

#### Intelligent Response Generation
```javascript
// faqBotService.js - FAQ Response
exports.getBotReply = async (message) => {
  const prompt = `
You are a highly intelligent, professional customer support assistant with expert knowledge based on the FAQ content below. Your goal is to provide accurate, thorough, and impressively clear answers to customers' questions.

Guidelines for your responses:
- Use the FAQ content as your only knowledge source
- Provide direct, confident, and helpful answers
- Communicate with empathy, patience, and professionalism
- Keep answers concise yet comprehensive
- Always maintain a positive, friendly tone

FAQ Content:
${faqData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

User question: ${message}

Answer:
`;

  const response = await axios.post(url, {
    messages: [
      { role: 'system', content: 'You are a helpful support assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 300,
    stop: ['User question:', 'Answer:']
  }, {
    headers: {
      'api-key': enc.decrypt(process.env.AZURE_OPENAI_KEY),
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content.trim();
};
```

## AI Workflow Patterns

### 1. **Ticket Classification Workflow**
```
Input: Ticket (title + description)
    ↓
Azure OpenAI Analysis
    ↓
JSON Response Parsing
    ↓
Database Storage
    ↓
Output: Classified Ticket with Priority, Team, Tags
```

### 2. **Voice Analysis Workflow**
```
Input: Audio File
    ↓
AssemblyAI Transcription
    ↓
Azure OpenAI Analysis
    ↓
Response Parsing
    ↓
Database Storage
    ↓
Output: Voice Insights (Summary, Sentiment, Topics)
```

### 3. **FAQ Response Workflow**
```
Input: User Question
    ↓
FAQ Knowledge Base Retrieval
    ↓
Azure OpenAI Processing
    ↓
Response Generation
    ↓
Output: Intelligent Answer
```

## Error Handling and Fallbacks

### 1. **AI Service Error Handling**
```javascript
// Graceful degradation for AI failures
const classifyTicket = async (title, description) => {
  try {
    const aiResponse = await callAzureOpenAI(title, description);
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    return {
      priority: 'medium',
      assigned_team: 'General',
      tags: [],
      confidence: 0.5,
    };
  }
};
```

### 2. **Transcription Error Handling**
```javascript
// AssemblyAI error handling
async function transcribeAudio(filePath) {
  try {
    // Transcription logic
    return transcript;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Audio transcription failed');
  }
}
```

## Performance Optimization

### 1. **Response Caching**
```javascript
// Cache AI responses (future enhancement)
const cache = new Map();

const getCachedResponse = async (key, aiFunction) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await aiFunction();
  cache.set(key, response);
  return response;
};
```

### 2. **Batch Processing**
```javascript
// Process multiple tickets in batch
const processBatchTickets = async (tickets) => {
  const batchPromises = tickets.map(ticket => 
    classifyTicket(ticket.title, ticket.description)
  );
  
  return Promise.all(batchPromises);
};
```

## Security Implementation

### 1. **API Key Encryption**
```javascript
// Encrypt sensitive API keys
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### 2. **Input Sanitization**
```javascript
// Sanitize AI inputs
const sanitizeInput = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .substring(0, 1000); // Limit length
};
```

## Monitoring and Analytics

### 1. **AI Performance Metrics**
```javascript
// Track AI response times
const trackAIPerformance = async (aiFunction, ...args) => {
  const start = Date.now();
  try {
    const result = await aiFunction(...args);
    const duration = Date.now() - start;
    
    console.log(`AI operation completed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error(`AI operation failed after ${Date.now() - start}ms:`, error);
    throw error;
  }
};
```

### 2. **Success Rate Tracking**
```javascript
// Monitor AI classification accuracy
const trackClassificationAccuracy = (predicted, actual) => {
  const accuracy = calculateAccuracy(predicted, actual);
  console.log(`Classification accuracy: ${accuracy}%`);
  return accuracy;
};
```

## Future Enhancements

### 1. **Advanced AI Features**
- Real-time sentiment analysis
- Predictive ticket routing
- Automated response suggestions
- Customer intent prediction

### 2. **Multi-Modal AI**
- Image analysis for screenshots
- Video call analysis
- Document processing
- Multi-language support

### 3. **AI Model Management**
- A/B testing for different models
- Model performance monitoring
- Automatic model updates
- Custom model training

## Best Practices

### 1. **Prompt Engineering**
- Clear, specific instructions
- Consistent formatting
- Error handling in prompts
- Version control for prompts

### 2. **Response Validation**
- JSON schema validation
- Fallback responses
- Error recovery
- Quality assurance

### 3. **Cost Optimization**
- Token usage monitoring
- Efficient prompt design
- Caching strategies
- Batch processing

## Integration Testing

### 1. **AI Service Testing**
```javascript
// Test AI classification
const testTicketClassification = async () => {
  const testCases = [
    {
      title: "Payment failed",
      description: "Credit card payment declined",
      expected: { priority: "high", team: "Billing" }
    }
  ];
  
  for (const testCase of testCases) {
    const result = await classifyTicket(testCase.title, testCase.description);
    assert(result.priority === testCase.expected.priority);
  }
};
```

### 2. **Voice Analysis Testing**
```javascript
// Test voice transcription
const testVoiceTranscription = async () => {
  const testAudio = "path/to/test/audio.wav";
  const transcript = await transcribeAudio(testAudio);
  assert(transcript.length > 0);
};
```

This AI integration architecture provides a robust, scalable foundation for intelligent customer support automation with proper error handling, security, and performance optimization.
