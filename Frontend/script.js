// DOM Elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const typingIndicator = document.getElementById('typing-indicator');

// Append message to chat
function appendMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  // Safely set text content to prevent XSS
  const textNode = document.createTextNode(message);
  messageDiv.appendChild(textNode);

  chatBox.appendChild(messageDiv);

  // Animate message appearance
  setTimeout(() => {
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 10);

  // Scroll to bottom with smooth behavior
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth',
  });
}

// Show typing indicator
function showTypingIndicator() {
  typingIndicator.style.display = 'flex';
  chatBox.appendChild(typingIndicator);

  // Scroll to bottom to show indicator
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth',
  });
}

// Hide typing indicator
function hideTypingIndicator() {
  typingIndicator.style.display = 'none';
}

// Handle message sending
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to chat
  appendMessage(message, 'user');
  userInput.value = '';
  userInput.focus();

  // Show typing indicator
  showTypingIndicator();

  try {
    // Send to backend
    const response = await fetch('http://localhost:5000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, email: 'user@gmail.com' }),
    });

    const data = await response.json();

    // Hide typing indicator and show bot response
    hideTypingIndicator();
    appendMessage(data.reply, 'bot');
    addFeedbackButtons(data.id);
  } catch (err) {
    // Handle errors
    hideTypingIndicator();
    appendMessage('Oops! I encountered an error. Please try again.', 'bot');
    console.error('API Error:', err);
  }
}

function addFeedbackButtons(faqId) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <button onclick="sendFeedback('${faqId}', 'positive')">👍</button>
    <button onclick="sendFeedback('${faqId}', 'negative')">👎</button>
  `;
  box.appendChild(div);
}

// Form submission handler
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Enter key handler (without shift)
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Initial bot greeting
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    appendMessage(
      "Hello! I'm your Smart Assistant. Ask me anything about our services. how can i assit you today",
      'bot'
    );
  }, 500);
});


async function sendFeedback(id, feedback) {
  try {
    await fetch(`http://localhost:5000/ask/feedback/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    addMessage("Bot", `Feedback noted: ${feedback}`, "bot");
  } catch (err) {
    addMessage("Bot", "Feedback failed.", "bot");
  }
}
