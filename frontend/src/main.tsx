import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App";
import MisFantasys from "./pages/MisFantasys";
import Clasificacion from "./pages/Clasificacion";
import MiEquipo from "./pages/MiEquipo";
import MercadoFichajes from "./pages/MercadoFichajes";
import ActividadMercado from "./pages/ActividadMercado";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<MisFantasys />} />
            <Route path="clasificacion/:leagueId" element={<Clasificacion />} />
            <Route path="mi-equipo" element={<MiEquipo />} />
            <Route path="mercado" element={<MercadoFichajes />} />
            <Route path="actividad" element={<ActividadMercado />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
