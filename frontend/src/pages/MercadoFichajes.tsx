import { useEffect, useState } from "react";
import { api, MarketListing } from "../lib/api";
import { useCurrentUser } from "../lib/CurrentUserContext";

type Tab = "mercado" | "operaciones" | "historico";

export default function MercadoFichajes() {
  const [tab, setTab] = useState<Tab>("mercado");

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Mercado de Fichajes</h1>
      <div className="flex gap-2 mb-4 border-b">
        {(
          [
            ["mercado", "Mercado"],
            ["operaciones", "Mis Operaciones"],
            ["historico", "Histórico Personal"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t ? "border-b-2 border-accent text-primary" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "mercado" && <Mercado />}
      {tab === "operaciones" && <MisOperaciones />}
      {tab === "historico" && <HistoricoPersonal />}
    </div>
  );
}

function Mercado() {
  const { userId } = useCurrentUser();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api.getMarket().then(setListings).catch(() => {});
  }
  useEffect(load, []);

  async function bid(listingId: string) {
    const amount = Number(bidAmounts[listingId]);
    if (!userId) return setMessage("Configura tu usuario de prueba primero");
    if (!amount) return setMessage("Escribe una cantidad válida");
    try {
      await api.placeBid(listingId, userId, amount);
      setMessage("Puja realizada");
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  return (
    <div>
      {message && <p className="text-sm mb-2">{message}</p>}
      <div className="space-y-2">
        {listings.map((l) => {
          const topBid = l.bids
            .filter((b) => b.status === "WINNING")
            .sort((a, b) => b.amount - a.amount)[0];
          return (
            <div key={l.id} className="border rounded-xl p-3 bg-white shadow-sm flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">{l.player.name}</p>
                <p className="text-xs text-slate-500">
                  {l.player.position} · {l.player.club.name} · Salida: {l.askingPrice}M
                  {l.seller && ` · Vende: ${l.seller.name}`}
                </p>
                {topBid && <p className="text-xs text-accent">Puja más alta: {topBid.amount}M</p>}
              </div>
              <input
                type="number"
                placeholder="Tu puja"
                className="border rounded-lg px-2 py-1 text-sm w-24"
                value={bidAmounts[l.id] ?? ""}
                onChange={(e) => setBidAmounts({ ...bidAmounts, [l.id]: e.target.value })}
              />
              <button
                onClick={() => bid(l.id)}
                className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg"
              >
                Pujar
              </button>
            </div>
          );
        })}
        {listings.length === 0 && <p className="text-sm text-slate-500">No hay jugadores en el mercado ahora mismo.</p>}
      </div>
    </div>
  );
}

function MisOperaciones() {
  const { userId } = useCurrentUser();
  const [data, setData] = useState<{ compras: any[]; ventas: any[] } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    if (userId) api.getMyOperations(userId).then(setData).catch(() => {});
  }
  useEffect(load, [userId]);

  async function accept(listingId: string, bidId: string) {
    try {
      await api.acceptBid(listingId, userId, bidId);
      setMessage("Puja aceptada, traspaso completado");
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }
  async function reject(listingId: string, bidId: string) {
    try {
      await api.rejectBid(listingId, userId, bidId);
      setMessage("Puja rechazada");
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  if (!userId) return <p className="text-sm text-slate-500">Configura tu usuario de prueba primero.</p>;
  if (!data) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-6">
      {message && <p className="text-sm">{message}</p>}
      <div>
        <h3 className="font-semibold text-sm mb-2">Compras (pujas activas)</h3>
        <div className="space-y-2">
          {data.compras.map((b: any) => (
            <div key={b.id} className="border rounded-lg p-2 bg-white text-sm flex justify-between">
              <span>{b.listing.player.name}</span>
              <span className="font-semibold">
                {b.amount}M · {b.status}
              </span>
            </div>
          ))}
          {data.compras.length === 0 && <p className="text-sm text-slate-500">Sin pujas activas.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Ventas (jugadores que has puesto en venta)</h3>
        <div className="space-y-2">
          {data.ventas.map((listing: any) => (
            <div key={listing.id} className="border rounded-lg p-2 bg-white text-sm">
              <p className="font-medium">
                {listing.player.name} · Salida: {listing.askingPrice}M
              </p>
              {listing.bids
                .filter((b: any) => b.status === "WINNING")
                .map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between mt-1">
                    <span>Puja recibida: {b.amount}M</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => accept(listing.id, b.id)}
                        className="text-xs bg-primary text-white px-2 py-1 rounded"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => reject(listing.id, b.id)}
                        className="text-xs bg-slate-200 px-2 py-1 rounded"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
          {data.ventas.length === 0 && <p className="text-sm text-slate-500">No tienes jugadores en venta.</p>}
        </div>
      </div>
    </div>
  );
}

function HistoricoPersonal() {
  const { userId } = useCurrentUser();
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    if (userId) api.getHistory(userId).then(setOperations).catch(() => {});
  }, [userId]);

  if (!userId) return <p className="text-sm text-slate-500">Configura tu usuario de prueba primero.</p>;

  return (
    <div className="space-y-2">
      {operations.map((op) => (
        <div key={op.id} className="border rounded-lg p-2 bg-white text-sm flex justify-between">
          <span>
            {op.buyerId === userId ? "Compraste" : "Vendiste"} a {op.listing.player.name}
          </span>
          <span className="font-semibold">{op.price}M</span>
        </div>
      ))}
      {operations.length === 0 && <p className="text-sm text-slate-500">Sin movimientos todavía.</p>}
    </div>
  );
}
