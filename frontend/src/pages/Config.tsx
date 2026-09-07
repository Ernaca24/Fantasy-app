import { useCurrentUser } from "../lib/useCurrentUser";

// Página temporal: mientras no haya login real, aquí defines qué usuario
// y qué plantilla usar para probar la app. Se guarda en tu navegador.
export default function Config() {
  const { userId, setUserId, teamId, setTeamId } = useCurrentUser();

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-1">Configuración de prueba</h1>
      <p className="text-sm text-slate-600 mb-4">
        Temporal, hasta que montemos el login real. Pega aquí el ID de un usuario y de su
        plantilla (puedes verlos en la base de datos o crearlos llamando a la API).
      </p>
      <label className="text-xs text-slate-500 block mb-1">ID de usuario</label>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border rounded-lg px-2 py-1 text-sm w-full mb-3"
      />
      <label className="text-xs text-slate-500 block mb-1">ID de plantilla (UserTeam)</label>
      <input
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="border rounded-lg px-2 py-1 text-sm w-full"
      />
    </div>
  );
}
