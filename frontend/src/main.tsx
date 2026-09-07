import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import MisFantasys from "./pages/MisFantasys";
import Clasificacion from "./pages/Clasificacion";
import MiEquipo from "./pages/MiEquipo";
import MercadoFichajes from "./pages/MercadoFichajes";
import ActividadMercado from "./pages/ActividadMercado";
import Config from "./pages/Config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MisFantasys />} />
          <Route path="clasificacion/:leagueId" element={<Clasificacion />} />
          <Route path="mi-equipo" element={<MiEquipo />} />
          <Route path="mercado" element={<MercadoFichajes />} />
          <Route path="actividad" element={<ActividadMercado />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
