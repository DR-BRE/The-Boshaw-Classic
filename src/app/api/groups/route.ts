import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const players = await prisma.player.findMany({
      select: { id: true, displayName: true, group: true },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { firstName, lastName, handicap, group } = (await request.json()) as {
      firstName: string;
      lastName: string;
      handicap: number;
      group: number;
    };

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name required" }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        handicap: handicap || 0,
        group: group || 0,
      },
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { assignments } = await request.json();
    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await Promise.all(
      assignments.map(({ playerId, group }: { playerId: string; group: number }) =>
        prisma.player.update({
          where: { id: playerId },
          data: { group },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Groups PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    if (playerId) {
      // Delete a single player and their scores
      await prisma.score.deleteMany({ where: { playerId } });
      await prisma.player.delete({ where: { id: playerId } });
    } else {
      // Delete all non-admin players
      const adminPlayer = await prisma.player.findUnique({
        where: { userId: session.user.id },
      });
      await prisma.score.deleteMany({
        where: adminPlayer ? { playerId: { not: adminPlayer.id } } : {},
      });
      await prisma.player.deleteMany({
        where: adminPlayer ? { id: { not: adminPlayer.id } } : {},
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Groups DELETE error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
