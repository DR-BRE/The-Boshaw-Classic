export function getWolfForHole(
  wolfOrder: string[] | null,
  holeNumber: number
): string | null {
  if (!wolfOrder || holeNumber > 16) return null;
  return wolfOrder[(holeNumber - 1) % 4];
}

export interface WolfHoleResult {
  hole: number;
  wolfId?: string; // absent on solo holes (17, 18)
  partnerId?: string | null; // null = lone wolf; absent on solo holes
  wolfTeamBest?: number;
  opponentBest?: number;
  soloHole?: boolean; // true for holes 17 and 18 — everyone plays alone, low score wins 1 pt
  points: Record<string, number>; // playerId -> points for this hole
}

export interface WolfStandings {
  totals: Record<string, number>; // playerId -> running total
  holes: (WolfHoleResult | null)[]; // index 0 = hole 1, null = pending/no pick
}

/**
 * Calculate wolf points for a single hole.
 * Returns null if pick is missing or any player has no score for this hole.
 */
export function calculateWolfHole(
  hole: number,
  wolfOrder: string[],
  partnerId: string | null | undefined, // undefined = no pick yet
  playerScores: Record<string, number | null> // playerId -> score for this hole
): WolfHoleResult | null {
  if (partnerId === undefined) return null;

  const wolfId = getWolfForHole(wolfOrder, hole);
  if (!wolfId) return null;

  // Build teams
  const allIds = wolfOrder;
  const isLoneWolf = partnerId === null;
  const wolfTeam = isLoneWolf ? [wolfId] : [wolfId, partnerId];
  const opponents = allIds.filter((id) => !wolfTeam.includes(id));

  // Check all players have scores
  const allPlayers = [...wolfTeam, ...opponents];
  for (const id of allPlayers) {
    if (playerScores[id] === null || playerScores[id] === undefined) return null;
  }

  // Best ball for each side
  const wolfTeamBest = Math.min(...wolfTeam.map((id) => playerScores[id]!));
  const opponentBest = Math.min(...opponents.map((id) => playerScores[id]!));

  // Calculate points
  const points: Record<string, number> = {};
  for (const id of allPlayers) points[id] = 0;

  if (wolfTeamBest < opponentBest) {
    // Wolf team wins
    const pts = isLoneWolf ? 2 : 1;
    for (const w of wolfTeam) points[w] = pts;
  } else if (opponentBest < wolfTeamBest) {
    // Opponent team wins
    for (const o of opponents) points[o] = 1;
  }
  // Tie: all zeros (push)

  return { hole, wolfId, partnerId, wolfTeamBest, opponentBest, points };
}

/**
 * Calculate points for a solo hole (17 or 18): everyone plays alone, lowest score wins 1 point,
 * ties for low push (nobody scores). Returns null if any player has no score yet.
 */
export function calculateSoloHole(
  hole: number,
  playerIds: string[],
  playerScores: Record<string, number | null>
): WolfHoleResult | null {
  for (const id of playerIds) {
    if (playerScores[id] === null || playerScores[id] === undefined) return null;
  }

  const best = Math.min(...playerIds.map((id) => playerScores[id]!));
  const winners = playerIds.filter((id) => playerScores[id] === best);

  const points: Record<string, number> = {};
  for (const id of playerIds) points[id] = 0;

  // Single low score wins 1 pt; ties push
  if (winners.length === 1) {
    points[winners[0]] = 1;
  }

  return { hole, soloHole: true, points };
}

/**
 * Calculate wolf standings across all 18 holes.
 * Holes 1–16 use wolf rotation + picks; holes 17 and 18 are everyone-lone-wolf (low score = 1 pt).
 */
export function calculateWolfStandings(
  wolfOrder: string[],
  picks: Record<number, string | null>, // hole -> partnerId (null = lone wolf, missing = no pick)
  playerScoresPerHole: Record<string, (number | null)[]> // playerId -> 18-element array
): WolfStandings {
  const totals: Record<string, number> = {};
  for (const id of wolfOrder) totals[id] = 0;

  const holes: (WolfHoleResult | null)[] = [];

  for (let hole = 1; hole <= 18; hole++) {
    // Build per-hole score map
    const holeScores: Record<string, number | null> = {};
    for (const id of wolfOrder) {
      holeScores[id] = playerScoresPerHole[id]?.[hole - 1] ?? null;
    }

    const result =
      hole >= 17
        ? calculateSoloHole(hole, wolfOrder, holeScores)
        : calculateWolfHole(
            hole,
            wolfOrder,
            picks[hole] === undefined ? undefined : picks[hole],
            holeScores
          );

    holes.push(result);

    if (result) {
      for (const [id, pts] of Object.entries(result.points)) {
        totals[id] = (totals[id] ?? 0) + pts;
      }
    }
  }

  return { totals, holes };
}
