const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');

function appendMessage(message, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
  msgDiv.innerText = message.replace(/\n/g, '<br>');
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  debugger
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  input.value = '';

  try {
    const response = await fetch('http://localhost:5000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    appendMessage(data.reply, 'bot');
  } catch (err) {
    appendMessage("Error connecting to server.", 'bot');
    console.error(err);
  }
}
