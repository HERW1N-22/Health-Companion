import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";

export default function DashboardPage({ token }) {
  const [summary, setSummary] = useState({ entries: [], vitals: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health-export/export", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "Unable to load your overview. Please try logging in again.",
          );
        return response.json();
      })
      .then(setSummary)
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [token]);

  const chartData = useMemo(
    () =>
      summary.vitals.map((entry, index) => ({
        name: `#${index + 1}`,
        value: Number(entry.value),
      })),
    [summary.vitals],
  );

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text("AI Health Companion Report", 14, 16);
    doc.text(`Entries logged: ${summary.entries.length}`, 14, 32);
    doc.text(`Vitals logged: ${summary.vitals.length}`, 14, 40);
    doc.save("health-report.pdf");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div role="status">{loading ? "Loading your overview…" : null}</div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="grid">
        <div className="panel glass-card">
          <h2>Wellness overview</h2>
          <p>Recent daily entries and vitals are summarized here.</p>
          <button
            disabled={loading || Boolean(error)}
            className="primary-btn"
            onClick={exportPdf}
          >
            Generate PDF report
          </button>
        </div>
        <div className="panel glass-card">
          <h2>Recent activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!loading && !error && summary.entries.length === 0 && (
              <p>
                Your story starts here. Add a habit in your daily tracker to see
                it here.
              </p>
            )}
            {summary.entries.slice(0, 4).map((entry) => (
              <div key={entry.id} className="metric-card">
                <strong>{entry.entry_type}</strong>
                <div>{entry.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel glass-card" style={{ marginTop: 16 }}>
        <h2>Vitals trend</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#dbe3d2" />
              <XAxis dataKey="name" stroke="#65765a" />
              <YAxis stroke="#65765a" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#658267"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
