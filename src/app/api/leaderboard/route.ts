import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const roundFilter = searchParams.get("round");

  const players = await prisma.player.findMany({
    include: { scores: true },
    orderBy: { displayName: "asc" },
  });

  const entries: Omit<LeaderboardEntry, "rank">[] = players.map((player) => {
    const filteredScores = roundFilter
      ? player.scores.filter((s) => s.round === Number(roundFilter))
      : player.scores;

    const totalToPar = filteredScores.reduce((sum, s) => sum + s.toPar, 0);
    const totalStrokes = filteredScores.reduce((sum, s) => sum + s.totalStrokes, 0);

    return {
      playerId: player.id,
      displayName: player.displayName,
      firstName: player.firstName,
      lastName: player.lastName,
      avatarUrl: player.avatarUrl,
      group: player.group,
      handicap: player.handicap,
      totalToPar,
      totalStrokes,
      roundsPlayed: filteredScores.length,
      rounds: filteredScores.map((s) => ({
        round: s.round,
        course: s.course,
        strokes: s.totalStrokes,
        toPar: s.toPar,
      })),
    };
  });

  // Sort by totalToPar ascending, then totalStrokes as tiebreaker
  entries.sort((a, b) => a.totalToPar - b.totalToPar || a.totalStrokes - b.totalStrokes);

  // Assign ranks (tied players share rank)
  let currentRank = 1;
  const ranked: LeaderboardEntry[] = entries.map((entry, i) => {
    if (i > 0 && (entry.totalToPar !== entries[i - 1].totalToPar || entry.totalStrokes !== entries[i - 1].totalStrokes)) {
      currentRank = i + 1;
    }
    return { ...entry, rank: currentRank };
  });

  return NextResponse.json(ranked);
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
