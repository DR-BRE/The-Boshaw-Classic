import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TOURNAMENT, COURSE_PARS } from "@/lib/tournament";
import type { ScorecardData, ScorecardPlayer } from "@/lib/types/scorecard";

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
};

function extractHoleScores(score: Record<string, unknown>): number[] {
  return Array.from({ length: 18 }, (_, i) => score[`hole${i + 1}`] as number);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundNum = Number(searchParams.get("round") || "1");
    const courseName = ROUND_COURSES[roundNum];

    if (!courseName) {
      return NextResponse.json({ error: "Invalid round" }, { status: 400 });
    }

    const courseKey = courseName as keyof typeof COURSE_PARS;
    const coursePar = COURSE_PARS[courseKey];

    const players = await prisma.player.findMany({
      include: { scores: { where: { round: roundNum } } },
      orderBy: { displayName: "asc" },
    });

    const scorecardPlayers: ScorecardPlayer[] = players.map((player) => {
      const score = player.scores[0];

      if (!score) {
        return {
          id: player.id,
          displayName: player.displayName,
          avatarUrl: player.avatarUrl,
          handicap: player.handicap,
          group: player.group,
          scores: Array(18).fill(null),
          front9: null,
          back9: null,
          gross: null,
          net: null,
        };
      }

      const holes = extractHoleScores(score as unknown as Record<string, unknown>);
      const front9 = holes.slice(0, 9).reduce((sum, s) => sum + s, 0);
      const back9 = holes.slice(9).reduce((sum, s) => sum + s, 0);
      const gross = front9 + back9;
      const net = gross - player.handicap;

      return {
        id: player.id,
        displayName: player.displayName,
        avatarUrl: player.avatarUrl,
        handicap: player.handicap,
        group: player.group,
        scores: holes,
        front9,
        back9,
        gross,
        net,
      };
    });

    const data: ScorecardData = {
      course: {
        name: courseName,
        par: coursePar.total,
        holes: [...coursePar.holes],
      },
      players: scorecardPlayers,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scorecard API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
