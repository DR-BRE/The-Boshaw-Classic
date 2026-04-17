"use client";

import { useEffect, useRef, useState } from "react";
import type { ScorecardData } from "@/lib/types/scorecard";

type ToastKind = "birdie" | "eagle" | "ace";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ACTIVE_ROUNDS = [1, 2];
const POLL_MS = 5000;
const TOAST_MS = 5000;

function kindFor(score: number, par: number): ToastKind | null {
  if (score === 1) return "ace";
  const delta = score - par;
  if (delta <= -2) return "eagle";
  if (delta === -1) return "birdie";
  return null;
}

function verbFor(kind: ToastKind): string {
  if (kind === "ace") return "made an ACE on";
  if (kind === "eagle") return "eagled";
  return "birdied";
}

function firstName(displayName: string): string {
  return displayName.split(" ")[0] || displayName;
}

export default function ScoreToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Keys we've already counted — format "playerId:round:holeIdx:score" so
  // edits that change the score create a new key.
  const seenRef = useRef<Set<string>>(new Set());
  // Rounds we've completed the initial seed poll for. Before a round is
  // seeded, we record its current state without firing toasts — otherwise
  // every existing birdie would fire on page load.
  const seededRef = useRef<Set<number>>(new Set());
  const toastIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function pushToast(message: string, kind: ToastKind) {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_MS);
    }

    async function pollRound(round: number) {
      try {
        const res = await fetch(`/api/scorecard?round=${round}`);
        if (!res.ok) return;
        const data = (await res.json()) as ScorecardData;
        if (cancelled) return;
        if (!data?.players || !data?.course?.holes) return;

        const isInitial = !seededRef.current.has(round);
        for (const p of data.players) {
          for (let h = 0; h < 18; h++) {
            const score = p.scores[h];
            if (score === null || score === undefined) continue;
            const key = `${p.id}:${round}:${h}:${score}`;
            if (seenRef.current.has(key)) continue;
            seenRef.current.add(key);
            if (isInitial) continue;

            const kind = kindFor(score, data.course.holes[h]);
            if (!kind) continue;
            const name = firstName(p.displayName);
            const suffix = kind === "ace" ? "!" : "";
            pushToast(`${name} just ${verbFor(kind)} hole ${h + 1}${suffix}`, kind);
          }
        }
        seededRef.current.add(round);
      } catch {}
    }

    function pollAll() {
      for (const r of ACTIVE_ROUNDS) pollRound(r);
    }

    pollAll();
    const iv = setInterval(pollAll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-max max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-surface-container-high/95 backdrop-blur-xl border border-secondary/40 rounded-full px-5 py-2.5 shadow-xl shadow-black/40 flex items-center gap-2"
        >
          <span
            className={`font-label text-[10px] font-bold uppercase tracking-widest ${
              t.kind === "ace"
                ? "text-yellow-400"
                : t.kind === "eagle"
                ? "text-primary"
                : "text-secondary"
            }`}
          >
            {t.kind}
          </span>
          <span className="font-label text-sm font-bold text-on-surface whitespace-nowrap">
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
