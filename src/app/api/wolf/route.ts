import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const round = Number(searchParams.get("round"));
    const group = Number(searchParams.get("group"));

    if (!round || !group) {
      return NextResponse.json({ error: "Missing round or group" }, { status: 400 });
    }

    const wolfOrder = await prisma.wolfOrder.findUnique({
      where: { round_group: { round, group } },
    });

    return NextResponse.json({
      order: wolfOrder ? JSON.parse(wolfOrder.order) : null,
    });
  } catch (error) {
    console.error("Wolf GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { round, group } = await request.json();
    if (!round || !group) {
      return NextResponse.json({ error: "Missing round or group" }, { status: 400 });
    }

    // Get all players in this group
    const players = await prisma.player.findMany({
      where: { group },
      select: { id: true },
    });

    // Shuffle player IDs
    const ids = players.map((p) => p.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    // Clear any existing wolf picks when reshuffling
    await prisma.wolfPick.deleteMany({ where: { round, group } });

    const wolfOrder = await prisma.wolfOrder.upsert({
      where: { round_group: { round, group } },
      update: { order: JSON.stringify(ids) },
      create: { round, group, order: JSON.stringify(ids) },
    });

    return NextResponse.json({ order: JSON.parse(wolfOrder.order) });
  } catch (error) {
    console.error("Wolf POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
