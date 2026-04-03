import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: { scores: true },
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, firstName, lastName, handicap } = body;

    if (!displayName || !firstName || !lastName || handicap == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const handicapNum = Math.max(0, Math.min(54, Number(handicap)));

    const player = await prisma.player.upsert({
      where: { userId: session.user.id },
      update: {
        displayName,
        firstName,
        lastName,
        handicap: handicapNum,
        avatarUrl: session.user.image ?? null,
      },
      create: {
        userId: session.user.id,
        displayName,
        firstName,
        lastName,
        handicap: handicapNum,
        group: 0, // unassigned, admin can set later
        avatarUrl: session.user.image ?? null,
      },
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
