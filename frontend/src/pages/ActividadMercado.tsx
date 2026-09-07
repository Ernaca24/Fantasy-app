import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function ActividadMercado() {
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    api.getMarketActivity().then(setOperations).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Actividad del Mercado</h1>
      <div className="space-y-2">
        {operations.map((op) => (
          <div key={op.id} className="border rounded-lg p-3 bg-white shadow-sm text-sm">
            <span className="font-medium">{op.buyer?.name ?? "Alguien"}</span> fichó a{" "}
            <span className="font-medium">{op.listing.player.name}</span>
            {op.seller ? (
              <>
                {" "}
                de <span className="font-medium">{op.seller.name}</span>
              </>
            ) : (
              " del mercado libre"
            )}{" "}
            por <span className="font-semibold text-accent">{op.price}M</span>
          </div>
        ))}
        {operations.length === 0 && <p className="text-sm text-slate-500">Todavía no hay movimientos en el mercado.</p>}
      </div>
    </div>
  );
}
