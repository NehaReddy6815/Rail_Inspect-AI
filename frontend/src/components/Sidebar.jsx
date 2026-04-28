import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-56 h-screen bg-gray-900 text-white fixed p-6">
      <h2 className="text-2xl font-bold mb-8">🚆 RailInspect</h2>

      <nav className="space-y-4">
        <Link to="/" className="block hover:text-blue-400">Dashboard</Link>
        <Link to="/detect" className="block hover:text-blue-400">Detect</Link>
        <Link to="/reports" className="block hover:text-blue-400">Reports</Link>
        <Link to="/analytics" className="block hover:text-blue-400">Analytics</Link>
      </nav>
    </div>
  );
}