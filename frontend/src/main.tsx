import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import TeamBuilder from "./pages/TeamBuilder";
import League from "./pages/League";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="equipo" element={<TeamBuilder />} />
          <Route path="liga/:leagueId" element={<League />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
