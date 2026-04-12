import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COURSE_PARS, TOURNAMENT } from "@/lib/tournament";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
  3: TOURNAMENT.courses[2],
};

/** Extract individual hole scores from a Score record, preserving nulls */
function extractHoles(score: Record<string, unknown>): (number | null)[] {
  return Array.from({ length: 18 }, (_, i) => {
    const val = score[`hole${i + 1}`];
    return val !== null && val !== undefined ? (val as number) : null;
  });
}

/** Compute strokes and toPar from whatever holes are filled */
function computeFromHoles(holes: (number | null)[], coursePars: readonly number[]) {
  let strokes = 0;
  let par = 0;
  let filled = 0;
  for (let i = 0; i < 18; i++) {
    if (holes[i] !== null) {
      strokes += holes[i]!;
      par += coursePars[i];
      filled++;
    }
  }
  if (filled === 0) return { strokes: null, toPar: null };
  return { strokes, toPar: strokes - par };
}

export const dynamic = "force-dynamic";

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

      let totalToPar = 0;
      let totalStrokes = 0;

      const rounds = filteredScores.map((s) => {
        const courseName = ROUND_COURSES[s.round] || s.course;
        const courseKey = courseName as keyof typeof COURSE_PARS;
        const coursePars = COURSE_PARS[courseKey]?.holes;

        // Compute live from individual holes (never rely on pre-computed fields)
        const holes = extractHoles(s as unknown as Record<string, unknown>);
        const computed = coursePars
          ? computeFromHoles(holes, coursePars)
          : { strokes: s.totalStrokes, toPar: s.toPar };

        if (computed.toPar !== null) totalToPar += computed.toPar;
        if (computed.strokes !== null) totalStrokes += computed.strokes;

        return {
          round: s.round,
          course: s.course,
          strokes: computed.strokes,
          toPar: computed.toPar,
        };
      });

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
        rounds,
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

    return NextResponse.json(ranked, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
