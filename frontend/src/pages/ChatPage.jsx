import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChatPage({ token }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'How are you feeling today? I can help with wellness guidance, but I am not a doctor.' }]);
  const [draft, setDraft] = useState('');

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const nextMessages = [...messages, { role: 'user', content: draft }];
    setMessages(nextMessages);
    setDraft('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: draft })
    });
    const data = await response.json();
    setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel glass-card">
      <h2>AI health assistant</h2>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`message ${message.role === 'user' ? 'user' : ''}`}>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ marginTop: 16 }}>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} placeholder="Tell me how you’re feeling..." />
        <button className="primary-btn" style={{ marginTop: 12 }} type="submit">Send</button>
      </form>
    </motion.div>
  );
}
