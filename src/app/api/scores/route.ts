import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COURSE_PARS, TOURNAMENT } from "@/lib/tournament";

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
  3: TOURNAMENT.courses[2],
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roundNum = Number(searchParams.get("round") || "1");

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: { scores: { where: { round: roundNum } } },
    });

    if (!player) {
      return NextResponse.json({ error: "No player profile found" }, { status: 404 });
    }

    const courseName = ROUND_COURSES[roundNum];
    const courseKey = courseName as keyof typeof COURSE_PARS;

    return NextResponse.json({
      player: {
        id: player.id,
        displayName: player.displayName,
      },
      course: {
        name: courseName,
        par: COURSE_PARS[courseKey].total,
        holes: [...COURSE_PARS[courseKey].holes],
      },
      score: player.scores[0] || null,
    });
  } catch (error) {
    console.error("Scores GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { round, holes } = body as { round: number; holes: number[] };

    if (!round || !holes || holes.length !== 18) {
      return NextResponse.json({ error: "Invalid data: need round and 18 hole scores" }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
    });

    if (!player) {
      return NextResponse.json({ error: "No player profile found" }, { status: 404 });
    }

    const courseName = ROUND_COURSES[round];
    if (!courseName) {
      return NextResponse.json({ error: "Invalid round" }, { status: 400 });
    }

    const courseKey = courseName as keyof typeof COURSE_PARS;
    const allFilled = holes.every((h: number | null) => h !== null && h !== undefined);
    const totalStrokes = allFilled ? holes.reduce((sum: number, s: number) => sum + s, 0) : null;
    const toPar = totalStrokes !== null ? totalStrokes - COURSE_PARS[courseKey].total : null;

    const score = await prisma.score.upsert({
      where: {
        playerId_round: { playerId: player.id, round },
      },
      update: {
        course: courseName,
        hole1: holes[0], hole2: holes[1], hole3: holes[2],
        hole4: holes[3], hole5: holes[4], hole6: holes[5],
        hole7: holes[6], hole8: holes[7], hole9: holes[8],
        hole10: holes[9], hole11: holes[10], hole12: holes[11],
        hole13: holes[12], hole14: holes[13], hole15: holes[14],
        hole16: holes[15], hole17: holes[16], hole18: holes[17],
        totalStrokes,
        toPar,
      },
      create: {
        playerId: player.id,
        round,
        course: courseName,
        hole1: holes[0], hole2: holes[1], hole3: holes[2],
        hole4: holes[3], hole5: holes[4], hole6: holes[5],
        hole7: holes[6], hole8: holes[7], hole9: holes[8],
        hole10: holes[9], hole11: holes[10], hole12: holes[11],
        hole13: holes[12], hole14: holes[13], hole15: holes[14],
        hole16: holes[15], hole17: holes[16], hole18: holes[17],
        totalStrokes,
        toPar,
      },
    });

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Scores POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
