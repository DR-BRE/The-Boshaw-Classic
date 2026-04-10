import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWolfForHole } from "@/lib/wolf";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const round = Number(searchParams.get("round"));
    const group = Number(searchParams.get("group"));

    if (!round || !group) {
      return NextResponse.json({ error: "Missing round or group" }, { status: 400 });
    }

    const rows = await prisma.wolfPick.findMany({
      where: { round, group },
    });

    const picks: Record<number, string | null> = {};
    for (const row of rows) {
      picks[row.hole] = row.partnerId;
    }

    return NextResponse.json({ picks });
  } catch (error) {
    console.error("Wolf picks GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { round, group, hole, partnerId } = await request.json();
    if (!round || !group || !hole || hole < 1 || hole > 16) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const isAdmin = session.user.email === ADMIN_EMAIL;

    if (!isAdmin) {
      // Verify the user is the wolf for this hole
      const wolfOrder = await prisma.wolfOrder.findUnique({
        where: { round_group: { round, group } },
      });
      if (!wolfOrder) {
        return NextResponse.json({ error: "No wolf order found" }, { status: 404 });
      }

      const order = JSON.parse(wolfOrder.order) as string[];
      const wolfId = getWolfForHole(order, hole);

      // Look up the requesting user's player ID
      const player = await prisma.player.findFirst({
        where: { user: { email: session.user.email } },
        select: { id: true },
      });

      if (!player || player.id !== wolfId) {
        return NextResponse.json({ error: "Only the wolf or admin can pick" }, { status: 403 });
      }
    }

    const pick = await prisma.wolfPick.upsert({
      where: { round_group_hole: { round, group, hole } },
      update: { partnerId: partnerId ?? null },
      create: { round, group, hole, partnerId: partnerId ?? null },
    });

    return NextResponse.json({ pick });
  } catch (error) {
    console.error("Wolf picks POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
