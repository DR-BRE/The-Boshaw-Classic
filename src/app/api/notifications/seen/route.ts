import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!player) {
      return NextResponse.json({ error: "No player profile found" }, { status: 404 });
    }

    const seenAt = new Date();
    await prisma.player.update({
      where: { id: player.id },
      data: { notificationsSeenAt: seenAt },
    });

    return NextResponse.json({ ok: true, seenAt: seenAt.toISOString() });
  } catch (error) {
    console.error("Notifications seen POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
