import "dotenv/config";
import express from "express";
import cors from "cors";
import { playersRouter } from "./routes/players.js";
import { teamsRouter } from "./routes/teams.js";
import { leaguesRouter } from "./routes/leagues.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", app: "MiFantasy API" });
});

app.use("/players", playersRouter);
app.use("/teams", teamsRouter);
app.use("/leagues", leaguesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
