import { useEffect, useState } from "react";
import { api, Player } from "../lib/api";
import PlayerCard from "../components/PlayerCard";

const BUDGET = 100;

export default function TeamBuilder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPlayers().then(setPlayers).catch((e) => setError(e.message));
  }, []);

  const spent = selected.reduce((sum, p) => sum + p.price, 0);
  const remaining = BUDGET - spent;

  function handleAdd(player: Player) {
    if (selected.length >= 15) return setError("Ya tienes 15 jugadores");
    if (selected.some((p) => p.id === player.id)) return;
    if (player.price > remaining) return setError("Presupuesto insuficiente");
    setSelected([...selected, player]);
    setError(null);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h1 className="text-xl font-bold mb-1">Armar plantilla</h1>
        <p className="text-sm text-slate-600 mb-3">
          Presupuesto restante: <strong>{remaining.toFixed(1)}M</strong> de {BUDGET}M
        </p>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="space-y-2">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} onAdd={handleAdd} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Mi plantilla ({selected.length}/15)</h2>
        <div className="space-y-2">
          {selected.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
