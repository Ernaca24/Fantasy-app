import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white px-4 py-3 flex items-center gap-6">
        <span className="font-bold text-lg">MiFantasy</span>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-accent">Dashboard</Link>
          <Link to="/equipo" className="hover:text-accent">Mi equipo</Link>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
