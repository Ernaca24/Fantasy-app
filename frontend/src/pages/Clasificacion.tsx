import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, StandingRow } from "../lib/api";

export default function Clasificacion() {
  const { leagueId } = useParams();
  const [leagueName, setLeagueName] = useState("");
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId) return;
    api
      .getStandings(leagueId)
      .then((data) => {
        setLeagueName(data.league);
        setStandings(data.standings);
      })
      .catch((e) => setError(e.message));
  }, [leagueId]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Clasificación</h1>
      {leagueName && <p className="text-sm text-slate-600 mb-3">{leagueName}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white text-left">
            <tr>
              <th className="px-3 py-2 w-10">#</th>
              <th className="px-3 py-2">Participante</th>
              <th className="px-3 py-2 text-right">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.userId} className="border-t">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 text-right font-semibold">{row.totalPoints}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                  Todavía no hay puntos registrados en esta liga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
