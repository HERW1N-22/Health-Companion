import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';

export default function DashboardPage({ token }) {
  const [summary, setSummary] = useState({ entries: [], vitals: [] });

  useEffect(() => {
    fetch('/api/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then(setSummary);
  }, [token]);

  const chartData = useMemo(() => summary.vitals.map((entry, index) => ({ name: `#${index + 1}`, value: Number(entry.value) })), [summary.vitals]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('AI Health Companion Report', 14, 16);
    doc.text(`Entries logged: ${summary.entries.length}`, 14, 32);
    doc.text(`Vitals logged: ${summary.vitals.length}`, 14, 40);
    doc.save('health-report.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid">
        <div className="panel glass-card">
          <h2>Wellness overview</h2>
          <p>Recent daily entries and vitals are summarized here.</p>
          <button className="primary-btn" onClick={exportPdf}>Generate PDF report</button>
        </div>
        <div className="panel glass-card">
          <h2>Recent activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
