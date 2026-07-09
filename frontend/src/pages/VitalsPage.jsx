import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function VitalsPage({ token }) {
  const [form, setForm] = useState({ type: 'bp', value: '', note: '' });
  const [vitals, setVitals] = useState([]);

  const fetchVitals = async () => {
    const response = await fetch('/api/vitals', { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setVitals(data);
  };

  useEffect(() => {
    fetchVitals();
  }, [token]);

  const submitEntry = async (event) => {
    event.preventDefault();
    await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setForm({ type: 'bp', value: '', note: '' });
    fetchVitals();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="panel glass-card">
        <h2>Log vitals</h2>
        <form onSubmit={submitEntry} className="form-grid">
          <label>
            Metric
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="bp">Blood Pressure</option>
              <option value="sugar">Sugar</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="weight">Weight</option>
            </select>
          </label>
          <label>
            Value
            <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="e.g. 120" />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Note
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows={4} />
          </label>
          <button className="primary-btn" type="submit">Save reading</button>
        </form>
      </div>
      <div className="panel glass-card">
        <h2>Recent vitals</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vitals.map((entry) => (
            <div key={entry.id} className="metric-card">
              <strong>{entry.metric_type}</strong>
              <div>{entry.value}</div>
              <small>{entry.note}</small>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
