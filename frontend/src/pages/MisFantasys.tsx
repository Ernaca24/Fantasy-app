import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, RealMatch } from "../lib/api";
import { useCurrentUser } from "../lib/CurrentUserContext";

function MatchRow({ match }: { match: RealMatch }) {
  const played = match.score !== null;
  return (
    <div className="py-2 border-b last:border-0 text-sm">
      <div className="flex items-center justify-between">
        <span className="flex-1 text-right">{match.team1}</span>
        <span className="mx-3 px-2 py-0.5 rounded font-bold bg-slate-100">
          {played ? `${match.score![0]} - ${match.score![1]}` : "vs"}
        </span>
        <span className="flex-1">{match.team2}</span>
      </div>
      <p className="text-center text-xs text-slate-400 mt-0.5">
        {new Date(match.date).toLocaleDateString("es-ES")}
      </p>
    </div>
  );
}

// Extrae el número de jornada de un texto tipo "Matchday 4" -> 4
function roundNumber(round: string): number {
  const match = round.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function MisFantasys() {
  const { userId } = useCurrentUser();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [matches, setMatches] = useState<RealMatch[]>([]);
  const [competition, setCompetition] = useState("");
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  useEffect(() => {
    if (userId) api.getMyLeagues(userId).then(setLeagues).catch((e) => setError(e.message));
    api
      .getRealMatches()
      .then((data) => {
        setCompetition(data.competition);
        setMatches(data.matches);
      })
      .catch((e) => setMatchesError(e.message));
  }, [userId]);

  // Agrupamos los partidos por jornada (round)
  const roundsSet = new Set(matches.map((m) => m.round));
  const rounds = Array.from(roundsSet).sort((a, b) => roundNumber(a) - roundNumber(b));

  // Si no hay jornada seleccionada, seleccionamos por defecto la primera
  // jornada que tenga algún partido sin jugar (la "jornada actual"),
  // o si todas están jugadas, la última.
  const defaultRound = (() => {
    const withPending = rounds.find((r) =>
      matches.some((m) => m.round === r && m.score === null)
    );
    return withPending || rounds[rounds.length - 1] || null;
  })();

  const activeRound = selectedRound ?? defaultRound;
  const matchesForActiveRound = matches.filter((m) => m.round === activeRound);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-xl font-bold mb-3">Mis Ligas</h1>
        {!userId && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            Inicia sesión para ver tus ligas.
          </p>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="space-y-2">
          {leagues.map((l) => (
            <Link
              key={l.id}
              to={`/clasificacion/${l.id}`}
              className="block border rounded-xl p-3 bg-white shadow-sm hover:border-primary"
            >
              <p className="font-medium">{l.name}</p>
              <p className="text-xs text-slate-500">Código de invitación: {l.inviteCode}</p>
            </Link>
          ))}
          {userId && leagues.length === 0 && (
            <p className="text-sm text-slate-500">Aún no perteneces a ninguna liga.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">{competition || "Partidos reales"}</h2>

        {/* Pestañas de jornadas */}
        {rounds.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
            {rounds.map((r) => {
              const num = roundNumber(r);
              const isActive = r === activeRound;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRound(r)}
                  className={
                    "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition " +
                    (isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary")
                  }
                >
                  J{num || r}
                </button>
              );
            })}
          </div>
        )}

        <div className="border rounded-xl p-3 bg-white shadow-sm">
          {matchesError && <p className="text-sm text-red-600">{matchesError}</p>}
          {!matchesError && matches.length === 0 && (
            <p className="text-sm text-slate-500">Sin partidos cerca de hoy.</p>
          )}
          {matchesForActiveRound.map((m, i) => (
            <MatchRow key={i} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}