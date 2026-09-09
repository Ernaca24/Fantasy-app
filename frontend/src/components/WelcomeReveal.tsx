import { useEffect, useState } from "react";
import { StarterPlayer } from "../lib/CurrentUserContext";

const POSITION_LABEL: Record<string, string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FWD: "Delantero",
};

export default function WelcomeReveal({
  players,
  onDone,
}: {
  players: StarterPlayer[];
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const finished = revealed >= players.length;

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 500);
    return () => clearTimeout(t);
  }, [revealed, finished]);

  return (
    <div className="fixed inset-0 bg-primary/95 z-50 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-2xl font-bold mb-1">¡Bienvenido a MiFantasy!</h1>
      <p className="text-sm text-slate-200 mb-6">Este es el equipo que te ha tocado...</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl w-full">
        {players.slice(0, revealed).map((p, i) => (
          <div
            key={p.id}
            className="bg-white text-primary rounded-xl p-3 shadow-lg animate-[fadeIn_0.4s_ease]"
            style={{ animationDelay: `${i * 0}ms` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2"
              style={{ backgroundColor: p.club.color ?? "#1e3a5f" }}
            >
              {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <p className="font-medium text-sm leading-tight">{p.name}</p>
            <p className="text-xs text-slate-500">
              {POSITION_LABEL[p.position]} · {p.club.name}
            </p>
          </div>
        ))}
      </div>

      {finished && (
        <button
          onClick={onDone}
          className="mt-8 bg-accent text-white px-6 py-2.5 rounded-lg font-medium"
        >
          ¡Vamos a jugar!
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
