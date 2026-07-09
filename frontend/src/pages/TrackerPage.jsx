import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TrackerPage({ token }) {
  const [form, setForm] = useState({ type: 'sleep', value: '', note: '' });
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    const response = await fetch('/api/health/entries', { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const submitEntry = async (event) => {
    event.preventDefault();
    await fetch('/api/health/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setForm({ type: 'sleep', value: '', note: '' });
    fetchEntries();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="panel glass-card">
        <h2>Daily tracker</h2>
        <form onSubmit={submitEntry} className="form-grid">
          <label>
            Category
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="sleep">Sleep</option>
              <option value="water">Water</option>
              <option value="meal">Meal</option>
              <option value="mood">Mood</option>
              <option value="exercise">Exercise</option>
              <option value="medication">Medication</option>
            </select>
          </label>
          <label>
            Value
            <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="8h, 2L, etc." />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Note
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows={4} />
          </label>
          <button className="primary-btn" type="submit">Save entry</button>
        </form>
      </div>
      <div className="panel glass-card">
        <h2>Recent log</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map((entry) => (
            <div key={entry.id} className="metric-card">
              <strong>{entry.entry_type}</strong>
              <div>{entry.value}</div>
              <small>{entry.note}</small>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
