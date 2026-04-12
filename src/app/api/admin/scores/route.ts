import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COURSE_PARS, TOURNAMENT } from "@/lib/tournament";

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
  3: TOURNAMENT.courses[2],
};

// GET all players with their scores
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const players = await prisma.player.findMany({
      include: { scores: true },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Admin scores GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT to update a player's score for a round
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { playerId, round, holes } = (await request.json()) as {
      playerId: string;
      round: number;
      holes: number[];
    };

    if (!playerId || !round || !holes || holes.length !== 18) {
      return NextResponse.json(
        { error: "Need playerId, round, and 18 hole scores" },
        { status: 400 }
      );
    }

    const courseName = ROUND_COURSES[round];
    if (!courseName) {
      return NextResponse.json({ error: "Invalid round" }, { status: 400 });
    }

    const courseKey = courseName as keyof typeof COURSE_PARS;
    const coursePars = COURSE_PARS[courseKey].holes;
    const filledIndices = holes.map((h: number | null, i: number) => h !== null && h !== undefined ? i : -1).filter((i: number) => i >= 0);
    const totalStrokes = filledIndices.length > 0
      ? filledIndices.reduce((sum: number, i: number) => sum + holes[i], 0)
      : null;
    const toPar = totalStrokes !== null
      ? totalStrokes - filledIndices.reduce((sum: number, i: number) => sum + coursePars[i], 0)
      : null;

    const score = await prisma.score.upsert({
      where: {
        playerId_round: { playerId, round },
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
        playerId,
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
    console.error("Admin scores PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH to update player details (name, handicap)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { playerId, firstName, lastName, handicap } = (await request.json()) as {
      playerId: string;
      firstName?: string;
      lastName?: string;
      handicap?: number;
    };

    if (!playerId) {
      return NextResponse.json({ error: "Need playerId" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (firstName !== undefined || lastName !== undefined) {
      const player = await prisma.player.findUnique({ where: { id: playerId } });
      data.displayName = `${firstName ?? player?.firstName} ${lastName ?? player?.lastName}`;
    }
    if (handicap !== undefined) data.handicap = handicap;

    const player = await prisma.player.update({
      where: { id: playerId },
      data,
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE a player's score for a round
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const roundParam = searchParams.get("round");

    if (!playerId) {
      return NextResponse.json({ error: "Need playerId" }, { status: 400 });
    }

    if (roundParam) {
      const round = Number(roundParam);
      await prisma.score.delete({
        where: { playerId_round: { playerId, round } },
      });
    } else {
      await prisma.score.deleteMany({ where: { playerId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin scores DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
