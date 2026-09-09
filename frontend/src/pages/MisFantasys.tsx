import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Match } from "../lib/api";
import { useCurrentUser } from "../lib/CurrentUserContext";

function MatchRow({ match }: { match: Match }) {
  const live = match.status === "LIVE";
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
      <span className="flex-1 text-right">{match.homeClub.name}</span>
      <span className={`mx-3 px-2 py-0.5 rounded font-bold ${live ? "bg-red-500 text-white" : "bg-slate-100"}`}>
        {match.status === "SCHEDULED" ? "vs" : `${match.homeScore} - ${match.awayScore}`}
      </span>
      <span className="flex-1">{match.awayClub.name}</span>
      {live && <span className="ml-2 text-xs text-red-600 font-semibold">{match.minute}'</span>}
    </div>
  );
}

export default function MisFantasys() {
  const { userId } = useCurrentUser();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) api.getMyLeagues(userId).then(setLeagues).catch((e) => setError(e.message));
    api.getMatches().then(setMatches).catch(() => {});
  }, [userId]);

  // Refresca los marcadores en vivo cada 30s
  useEffect(() => {
    const interval = setInterval(() => {
      api.getMatches().then(setMatches).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-xl font-bold mb-3">Mis Fantasys</h1>
        {!userId && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            No tienes un usuario de prueba configurado. Ve a la página de configuración temporal para crear uno.
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
        <h2 className="font-semibold mb-2">Partidos de la jornada</h2>
        <div className="border rounded-xl p-3 bg-white shadow-sm">
          {matches.length === 0 && <p className="text-sm text-slate-500">Sin partidos programados.</p>}
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
