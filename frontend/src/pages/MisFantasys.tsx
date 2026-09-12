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
        {match.round} · {new Date(match.date).toLocaleDateString("es-ES")}
      </p>
    </div>
  );
}

export default function MisFantasys() {
  const { userId } = useCurrentUser();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [matches, setMatches] = useState<RealMatch[]>([]);
  const [competition, setCompetition] = useState("");
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-xl font-bold mb-3">Mis Fantasys</h1>
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
        <div className="border rounded-xl p-3 bg-white shadow-sm">
          {matchesError && <p className="text-sm text-red-600">{matchesError}</p>}
          {!matchesError && matches.length === 0 && (
            <p className="text-sm text-slate-500">Sin partidos cerca de hoy.</p>
          )}
          {matches.map((m, i) => (
            <MatchRow key={i} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
