import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Analytics() {
  const [stats, setStats] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/history");
      const data = await res.json();

      console.log("Mongo Data:", data);

      if (!Array.isArray(data)) return;

      // =========================
      // 📊 STATS
      // =========================
      const totalScans = data.length;

      const totalDefects = data.reduce(
        (sum, item) => sum + item.total_defects,
        0
      );

      const allDetections = data.flatMap((d) => d.detections || []);

      const avgConfidence =
        allDetections.length > 0
          ? (
              allDetections.reduce((sum, d) => sum + d.confidence, 0) /
              allDetections.length
            ) * 100
          : 0;

      const highSeverity =
        allDetections.length > 0
          ? (
              allDetections.filter((d) => d.confidence > 0.8).length /
              allDetections.length
            ) * 100
          : 0;

      setStats([
        { title: "Total Scans", value: totalScans },
        { title: "Total Defects", value: totalDefects },
        { title: "Avg Confidence", value: avgConfidence.toFixed(1) + "%" },
        { title: "High Severity", value: highSeverity.toFixed(1) + "%" },
      ]);

      // =========================
      // 📈 LINE CHART (date-wise)
      // =========================
      const grouped = {};

      data.forEach((item) => {
        const date = new Date(item.timestamp).toLocaleDateString();

        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += item.total_defects;
      });

      const formattedLine = Object.keys(grouped).map((date) => ({
        day: date,
        defects: grouped[date],
      }));

      setLineData(formattedLine);

      // =========================
      // 📊 BAR CHART (severity)
      // =========================
      let low = 0,
        medium = 0,
        high = 0;

      allDetections.forEach((d) => {
        if (d.confidence > 0.8) high++;
        else if (d.confidence > 0.5) medium++;
        else low++;
      });

      setBarData([
        { name: "Low", value: low },
        { name: "Medium", value: medium },
        { name: "High", value: high },
      ]);

      // =========================
      // 📂 RECENT SCANS TABLE
      // =========================
      const recentData = data
        .slice(0, 5)
        .flatMap((item, idx) =>
          (item.detections || []).map((d, i) => ({
            id: `${idx}-${i}`,
            label: d.label,
            confidence: d.confidence,
            time: new Date(item.timestamp).toLocaleTimeString(),
          }))
        );

      setRecent(recentData);

    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  return (
    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>

      {/* 🔥 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-500">{s.title}</p>
            <h2 className="text-2xl font-bold">{s.value}</h2>
          </div>
        ))}
      </div>

      {/* 📈 Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-semibold mb-4">Defects Over Time</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="defects" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-semibold mb-4">Severity Distribution</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 📂 Recent Scans */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-semibold mb-4">Recent Scans</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500">
              <th>ID</th>
              <th>Label</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{r.id}</td>
                <td>{r.label}</td>
                <td>{(r.confidence * 100).toFixed(1)}%</td>
                <td>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}