import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TrackerPage({ token }) {
  const [form, setForm] = useState({ type: "sleep", value: "", note: "" });
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/health-export/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Unable to load your records. Please try again.");
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const submitEntry = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/health/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok)
        throw new Error(
          "We couldn’t save this record. Please try again later.",
        );
      setForm({ type: "sleep", value: "", note: "" });
      await fetchEntries();
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
      className="grid"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      <div className="panel glass-card">
        <h2>Daily tracker</h2>
        <div role="alert">{error && <p className="form-error">{error}</p>}</div>
        <form onSubmit={submitEntry} className="form-grid">
          <label>
            Category
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
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
            <input
              required
              value={form.value}
              onChange={(event) =>
                setForm({ ...form, value: event.target.value })
              }
              placeholder="8h, 2L, etc."
            />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Note
            <textarea
              value={form.note}
              onChange={(event) =>
                setForm({ ...form, note: event.target.value })
              }
              rows={4}
            />
          </label>
          <button disabled={pending} className="primary-btn" type="submit">
            {pending ? "Saving…" : "Save entry"}
          </button>
        </form>
      </div>
      <div className="panel glass-card">
        <h2>Recent log</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.length === 0 && (
            <p>No records yet. Your next small step starts here.</p>
          )}
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
