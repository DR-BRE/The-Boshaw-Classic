export function getWolfForHole(
  wolfOrder: string[] | null,
  holeNumber: number
): string | null {
  if (!wolfOrder || holeNumber > 16) return null;
  return wolfOrder[(holeNumber - 1) % 4];
}

export interface WolfHoleResult {
  hole: number;
  wolfId: string;
  partnerId: string | null; // null = lone wolf
  wolfTeamBest: number;
  opponentBest: number;
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
    // Wolf side wins: each winner gets +1 per loser
    for (const w of wolfTeam) points[w] = opponents.length;
    for (const o of opponents) points[o] = -wolfTeam.length;
  } else if (opponentBest < wolfTeamBest) {
    // Opponent side wins
    for (const o of opponents) points[o] = wolfTeam.length;
    for (const w of wolfTeam) points[w] = -opponents.length;
  }
  // Tie: all zeros (already initialized)

  return { hole, wolfId, partnerId, wolfTeamBest, opponentBest, points };
}

/**
 * Calculate wolf standings across all 16 holes.
 */
export function calculateWolfStandings(
  wolfOrder: string[],
  picks: Record<number, string | null>, // hole -> partnerId (null = lone wolf, missing = no pick)
  playerScoresPerHole: Record<string, (number | null)[]> // playerId -> 18-element array
): WolfStandings {
  const totals: Record<string, number> = {};
  for (const id of wolfOrder) totals[id] = 0;

  const holes: (WolfHoleResult | null)[] = [];

  for (let hole = 1; hole <= 16; hole++) {
    const pickForHole = picks[hole];
    // Build per-hole score map
    const holeScores: Record<string, number | null> = {};
    for (const id of wolfOrder) {
      holeScores[id] = playerScoresPerHole[id]?.[hole - 1] ?? null;
    }

    const result = calculateWolfHole(
      hole,
      wolfOrder,
      pickForHole === undefined ? undefined : pickForHole,
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
