import { Player } from "../lib/api";

interface Props {
  player: Player;
  onAdd?: (player: Player) => void;
}

// Tarjeta de jugador genérica: sin foto oficial ni escudo, solo iniciales y color de club
export default function PlayerCard({ player, onAdd }: Props) {
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
        style={{ backgroundColor: player.club.color ?? "#1e3a5f" }}
      >
        {initials}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{player.name}</p>
        <p className="text-xs text-slate-500">
          {player.position} · {player.club.name} · {player.price}M
        </p>
      </div>
      {onAdd && (
        <button
          onClick={() => onAdd(player)}
          className="text-xs bg-accent text-white px-2 py-1 rounded-lg"
        >
          Fichar
        </button>
      )}
    </div>
  );
}
