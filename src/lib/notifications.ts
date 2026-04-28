import { COURSE_PARS, TOURNAMENT } from "@/lib/tournament";
import type { Prisma } from "@/generated/prisma/client";

export type NotificationType =
  | "BIRDIE"
  | "EAGLE"
  | "DOUBLE_EAGLE"
  | "HOLE_IN_ONE"
  | "LEADER_CHANGE";

const ACTIVE_ROUNDS = new Set([1, 2]);

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
  3: TOURNAMENT.courses[2],
};

export function notificationTypeForHole(
  strokes: number,
  par: number
): NotificationType | null {
  if (strokes === 1) return "HOLE_IN_ONE";
  const delta = strokes - par;
  if (delta <= -3) return "DOUBLE_EAGLE";
  if (delta === -2) return "EAGLE";
  if (delta === -1) return "BIRDIE";
  return null;
}

export function detectChangedHoleIndices(
  prevHoles: (number | null)[],
  newHoles: (number | null)[]
): number[] {
  return newHoles
    .map((v, i) => (v !== null && v !== prevHoles[i] ? i : -1))
    .filter((i) => i >= 0);
}

export function findClearLeader(
  standings: { playerId: string; totalToPar: number }[]
): string | null {
  if (standings.length === 0) return null;
  if (standings.length === 1) return standings[0].playerId;
  if (standings[0].totalToPar === standings[1].totalToPar) return null;
  return standings[0].playerId;
}

function extractHoles(score: Record<string, unknown>): (number | null)[] {
  return Array.from({ length: 18 }, (_, i) => {
    const val = score[`hole${i + 1}`];
    return val !== null && val !== undefined ? (val as number) : null;
  });
}

function computePlayerToPar(
  scores: { round: number; course: string; [key: string]: unknown }[]
): number {
  let total = 0;
  for (const s of scores) {
    if (!ACTIVE_ROUNDS.has(s.round)) continue;
    const courseName = ROUND_COURSES[s.round] || s.course;
    const courseKey = courseName as keyof typeof COURSE_PARS;
    const coursePars = COURSE_PARS[courseKey]?.holes;
    if (!coursePars) continue;
    const holes = extractHoles(s as Record<string, unknown>);
    for (let i = 0; i < 18; i++) {
      if (holes[i] !== null) total += holes[i]! - coursePars[i];
    }
  }
  return total;
}

export async function detectAndInsertNotifications(
  tx: Prisma.TransactionClient,
  {
    playerId,
    round,
    course,
    displayName,
    prevHoles,
    newHoles,
  }: {
    playerId: string;
    round: number;
    course: string;
    displayName: string;
    prevHoles: (number | null)[];
    newHoles: (number | null)[];
  }
): Promise<void> {
  const courseKey = course as keyof typeof COURSE_PARS;
  const coursePars = COURSE_PARS[courseKey]?.holes;
  if (!coursePars) return;

  // Hole-level notifications
  const changedIndices = detectChangedHoleIndices(prevHoles, newHoles);
  for (const i of changedIndices) {
    const strokes = newHoles[i]!;
    const par = coursePars[i];
    const type = notificationTypeForHole(strokes, par);
    if (!type) continue;
    await tx.notification.create({
      data: {
        type,
        round,
        playerId,
        hole: i + 1,
        course,
        strokes,
        payload: { displayName },
      },
    });
  }

  // Leader-change check (runs after the score upsert inside same transaction)
  const allPlayers = await tx.player.findMany({
    include: { scores: true },
  });

  const standings = allPlayers
    .filter((p) => p.scores.some((s) => ACTIVE_ROUNDS.has(s.round)))
    .map((p) => ({
      playerId: p.id,
      totalToPar: computePlayerToPar(
        p.scores as { round: number; course: string; [key: string]: unknown }[]
      ),
    }))
    .sort((a, b) => a.totalToPar - b.totalToPar);

  const newLeaderId = findClearLeader(standings);
  if (!newLeaderId) return;

  const lastLeaderChange = await tx.notification.findFirst({
    where: { type: "LEADER_CHANGE" },
    orderBy: { createdAt: "desc" },
  });

  const prevLeaderId = lastLeaderChange
    ? (lastLeaderChange.payload as { newLeaderId: string }).newLeaderId
    : null;

  if (newLeaderId === prevLeaderId) return;

  const newLeader = allPlayers.find((p) => p.id === newLeaderId);
  const prevLeader = prevLeaderId
    ? allPlayers.find((p) => p.id === prevLeaderId)
    : null;

  await tx.notification.create({
    data: {
      type: "LEADER_CHANGE",
      round,
      playerId: newLeaderId,
      payload: {
        newLeaderId,
        newLeaderName: newLeader?.displayName ?? "",
        previousLeaderId: prevLeaderId ?? null,
        previousLeaderName: prevLeader?.displayName ?? null,
      },
    },
  });
}
