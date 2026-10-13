import { useState } from "react";
import { motion } from "framer-motion";

export default function ChatPage({ token }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "How are you feeling today? I can help with wellness guidance, but I am not a doctor.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || pending) return;
    setPending(true);
    setError("");
    const nextMessages = [...messages, { role: "user", content: draft }];
    setMessages(nextMessages);
    setDraft("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: draft }),
      });
      const data = await response.json();
      if (!response.ok || !data.reply)
        throw new Error(
          "Your companion is unavailable right now. Please try again later.",
        );
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel glass-card"
    >
      <h2>AI health assistant</h2>
      <div className="chat-window" role="log" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`message ${message.role === "user" ? "user" : ""}`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div role="status">{pending && <p>Your companion is thinking…</p>}</div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <form onSubmit={sendMessage} style={{ marginTop: 16 }}>
        <textarea
          aria-label="Message to your health companion"
          required
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Tell me how you’re feeling..."
        />
        <button
          disabled={pending}
          className="primary-btn"
          style={{ marginTop: 12 }}
          type="submit"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </motion.div>
  );
}
