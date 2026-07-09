import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HealthAssistantPage({ token }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'I can help you reflect on your health trends, but I cannot diagnose. For urgent symptoms, consult a doctor.' }]);
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
      <h2>Conversation assistant</h2>
      <div className="chat-window">
        {messages.map((entry, index) => (
          <div key={`${entry.role}-${index}`} className={`message ${entry.role === 'user' ? 'user' : ''}`}>{entry.content}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ marginTop: 16 }}>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} placeholder="Share a symptom, question, or mood update" />
        <button className="primary-btn" style={{ marginTop: 12 }} type="submit">Send</button>
      </form>
    </motion.div>
  );
}
