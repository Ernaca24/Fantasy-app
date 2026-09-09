import { useEffect, useState } from "react";
import { api, Player } from "../lib/api";
import { useCurrentUser } from "../lib/CurrentUserContext";
import PlayerCard from "../components/PlayerCard";

type Tab = "once" | "plantilla" | "puntos";

export default function MiEquipo() {
  const { teamId } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("plantilla");
  // De momento el número de jornada se escribe a mano; más adelante se detectará sola
  const [gameweekId, setGameweekId] = useState("");

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Mi Equipo</h1>

      <div className="flex gap-2 mb-4 border-b">
        {(["once", "plantilla", "puntos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-b-2 border-accent text-primary" : "text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {(tab === "once" || tab === "puntos") && (
        <div className="mb-4">
          <label className="text-xs text-slate-500 block mb-1">ID de la jornada</label>
          <input
            value={gameweekId}
            onChange={(e) => setGameweekId(e.target.value)}
            placeholder="Pega aquí el id de la jornada"
            className="border rounded-lg px-2 py-1 text-sm w-72"
          />
        </div>
      )}

      {!teamId && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          No tienes una plantilla configurada todavía.
        </p>
      )}

      {teamId && tab === "plantilla" && <Plantilla teamId={teamId} />}
      {teamId && tab === "once" && gameweekId && <Once teamId={teamId} gameweekId={gameweekId} />}
      {teamId && tab === "puntos" && gameweekId && <Puntos teamId={teamId} gameweekId={gameweekId} />}
    </div>
  );
}

function Plantilla({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<any>(null);
  useEffect(() => {
    api.getTeam(teamId).then(setTeam);
  }, [teamId]);

  if (!team) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600 mb-2">{team.players.length} jugadores en plantilla</p>
      {team.players.map((utp: any) => (
        <PlayerCard key={utp.id} player={utp.player} />
      ))}
    </div>
  );
}

function Once({ teamId, gameweekId }: { teamId: string; gameweekId: string }) {
  const [team, setTeam] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, { starting: boolean; captain: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getTeam(teamId).then(setTeam);
    api
      .getLineup(teamId, gameweekId)
      .then((lineup) => {
        if (!lineup) return;
        const map: Record<string, { starting: boolean; captain: boolean }> = {};
        lineup.players.forEach((lp: any) => {
          map[lp.playerId] = { starting: lp.isStarting, captain: lp.isCaptain };
        });
        setSelected(map);
      })
      .catch(() => {});
  }, [teamId, gameweekId]);

  function toggleStarting(playerId: string) {
    setSelected((prev) => ({
      ...prev,
      [playerId]: { starting: !prev[playerId]?.starting, captain: prev[playerId]?.captain ?? false },
    }));
  }
  function setCaptain(playerId: string) {
    setSelected((prev) => {
      const next: typeof prev = {};
      for (const id in prev) next[id] = { ...prev[id], captain: id === playerId };
      if (!next[playerId]) next[playerId] = { starting: true, captain: true };
      return next;
    });
  }

  async function save() {
    if (!team) return;
    setSaving(true);
    setMessage(null);
    const players = team.players.map((utp: any) => ({
      playerId: utp.playerId,
      isStarting: selected[utp.playerId]?.starting ?? false,
      isCaptain: selected[utp.playerId]?.captain ?? false,
    }));
    try {
      await api.saveLineup(teamId, gameweekId, players);
      setMessage("Once guardado correctamente");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!team) return <p className="text-sm text-slate-500">Cargando...</p>;
  const startingCount = Object.values(selected).filter((s) => s.starting).length;

  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">
        Titulares seleccionados: <strong>{startingCount}/11</strong>
      </p>
      <div className="space-y-2 mb-4">
        {team.players.map((utp: any) => {
          const state = selected[utp.playerId];
          return (
            <div key={utp.id} className="flex items-center gap-2">
              <div className="flex-1">
                <PlayerCard player={utp.player} />
              </div>
              <button
                onClick={() => toggleStarting(utp.playerId)}
                className={`text-xs px-2 py-1 rounded ${state?.starting ? "bg-primary text-white" : "bg-slate-100"}`}
              >
                {state?.starting ? "Titular" : "Banquillo"}
              </button>
              <button
                onClick={() => setCaptain(utp.playerId)}
                className={`text-xs px-2 py-1 rounded ${state?.captain ? "bg-accent text-white" : "bg-slate-100"}`}
              >
                C
              </button>
            </div>
          );
        })}
      </div>
      {message && <p className="text-sm mb-2">{message}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar Once"}
      </button>
    </div>
  );
}

function Puntos({ teamId, gameweekId }: { teamId: string; gameweekId: string }) {
  const [data, setData] = useState<{ total: number; detail: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLineupPoints(teamId, gameweekId).then(setData).catch((e) => setError(e.message));
  }, [teamId, gameweekId]);

  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div>
      <p className="text-2xl font-bold mb-3">{data.total} puntos</p>
      <div className="space-y-1">
        {data.detail.map((d: any) => (
          <div key={d.playerId} className="flex justify-between text-sm border-b py-1">
            <span>
              {d.name} {d.isCaptain && <span className="text-accent font-semibold">(C)</span>}
            </span>
            <span className="font-semibold">{d.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
