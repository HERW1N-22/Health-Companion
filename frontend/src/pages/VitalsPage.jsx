import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function VitalsPage({ token }) {
  const [form, setForm] = useState({ type: "bp", value: "", note: "" });
  const [vitals, setVitals] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const fetchVitals = async () => {
    try {
      const response = await fetch("/api/vitals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Unable to load your records. Please try again.");
      const data = await response.json();
      setVitals(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [token]);

  const submitEntry = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/vitals", {
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
      setForm({ type: "bp", value: "", note: "" });
      await fetchVitals();
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
        <h2>Log vitals</h2>
        <div role="alert">{error && <p className="form-error">{error}</p>}</div>
        <form onSubmit={submitEntry} className="form-grid">
          <label>
            Metric
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="bp">Blood Pressure</option>
              <option value="sugar">Sugar</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="weight">Weight</option>
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
              placeholder="e.g. 120"
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
            {pending ? "Saving…" : "Save reading"}
          </button>
        </form>
      </div>
      <div className="panel glass-card">
        <h2>Recent vitals</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vitals.length === 0 && (
            <p>No records yet. Your next small step starts here.</p>
          )}
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
