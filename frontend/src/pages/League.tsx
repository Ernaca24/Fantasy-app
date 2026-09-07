import { useParams } from "react-router-dom";

export default function League() {
  const { leagueId } = useParams();
  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Liga {leagueId}</h1>
      <p className="text-slate-600 text-sm">
        Aquí mostrarás la clasificación (GET /leagues/:id/standings).
      </p>
    </div>
  );
}
