import { Position } from "@prisma/client";

/**
 * Reglas de puntuación estilo fantasy de fútbol.
 * Son mecánicas de juego genéricas (usadas por muchas plataformas distintas),
 * no elementos protegidos por copyright. Ajusta los valores a tu gusto.
 */
export interface StatInput {
  position: Position;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
}

const GOAL_POINTS: Record<Position, number> = {
  GK: 6,
  DEF: 6,
  MID: 5,
  FWD: 4,
};

export function calculateFantasyPoints(stat: StatInput): number {
  let points = 0;

  if (stat.minutesPlayed > 0) points += 1;
  if (stat.minutesPlayed >= 60) points += 1;

  points += stat.goals * GOAL_POINTS[stat.position];
  points += stat.assists * 3;

  if (stat.cleanSheet && (stat.position === "GK" || stat.position === "DEF")) {
    points += 4;
  } else if (stat.cleanSheet && stat.position === "MID") {
    points += 1;
  }

  points += stat.penaltiesSaved * 5;
  points -= stat.penaltiesMissed * 2;
  points -= stat.yellowCards * 1;
  points -= stat.redCards * 3;
  points -= stat.ownGoals * 2;

  return points;
}

/** Aplica el multiplicador de capitán (x2 es el estándar habitual). */
export function applyCaptainMultiplier(points: number, isCaptain: boolean): number {
  return isCaptain ? points * 2 : points;
}
