import { Link, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "./lib/CurrentUserContext";
import WelcomeReveal from "./components/WelcomeReveal";

export default function App() {
  const { starterSquad, clearStarterSquad } = useCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      {starterSquad && <WelcomeReveal players={starterSquad} onDone={clearStarterSquad} />}

      <header className="bg-primary text-white px-4 py-3 flex items-center gap-6 flex-wrap justify-between">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-bold text-lg">XI</span>
          <SignedIn>
            <nav className="flex gap-4 text-sm flex-wrap">
              <Link to="/" className="hover:text-accent">Mis XI</Link>
              <Link to="/mi-equipo" className="hover:text-accent">Mi Equipo</Link>
              <Link to="/mercado" className="hover:text-accent">Mercado de Fichajes</Link>
              <Link to="/actividad" className="hover:text-accent">Actividad del Mercado</Link>
            </nav>
          </SignedIn>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-accent text-white text-sm px-3 py-1.5 rounded-lg">
                Iniciar sesión
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>
      <main className="p-4">
        <SignedIn>
          <Outlet />
        </SignedIn>
        <SignedOut>
          <div className="text-center py-16">
            <h1 className="text-xl font-bold mb-2">Bienvenido a XI</h1>
            <p className="text-slate-600 text-sm">Inicia sesión arriba a la derecha para empezar a jugar.</p>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
