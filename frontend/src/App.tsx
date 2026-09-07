import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="font-bold text-lg">MiFantasy</span>
        <nav className="flex gap-4 text-sm flex-wrap">
          <Link to="/" className="hover:text-accent">Mis Fantasys</Link>
          <Link to="/mi-equipo" className="hover:text-accent">Mi Equipo</Link>
          <Link to="/mercado" className="hover:text-accent">Mercado de Fichajes</Link>
          <Link to="/actividad" className="hover:text-accent">Actividad del Mercado</Link>
          <Link to="/config" className="hover:text-accent text-slate-300">⚙ Config</Link>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
