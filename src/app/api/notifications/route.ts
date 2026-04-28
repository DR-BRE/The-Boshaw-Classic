import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      select: { notificationsSeenAt: true },
    });

    if (!player) {
      return NextResponse.json({ error: "No player profile found" }, { status: 404 });
    }

    const unreadCount = await prisma.notification.count({
      where:
        player.notificationsSeenAt === null
          ? {}
          : { createdAt: { gt: player.notificationsSeenAt } },
    });

    const notifications = await prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { player: { select: { displayName: true } } },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        round: n.round,
        course: n.course,
        hole: n.hole,
        strokes: n.strokes,
        playerId: n.playerId,
        playerName:
          n.player?.displayName ??
          (n.payload as { displayName?: string }).displayName ??
          null,
        payload: n.payload,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      lastSeenAt: player.notificationsSeenAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
