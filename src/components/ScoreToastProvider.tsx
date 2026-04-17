"use client";

import { useEffect, useRef, useState } from "react";
import type { ScorecardData } from "@/lib/types/scorecard";

type ToastKind = "birdie" | "eagle" | "ace";

interface Toast {
  id: number;
  playerName: string;
  hole: number;
  kind: ToastKind;
  exiting: boolean;
}

const ACTIVE_ROUNDS = [1, 2];
const POLL_MS = 5000;
const VISIBLE_MS = 4500;
const EXIT_MS = 300;

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

// Confetti config differs by rarity — bigger blast for rarer scores.
function confettiConfigFor(kind: ToastKind) {
  if (kind === "ace") {
    return {
      particleCount: 220,
      spread: 140,
      startVelocity: 55,
      scalar: 1.2,
      colors: ["#e9c349", "#ffe088", "#a9cfbf", "#ffffff", "#ff6b6b"],
    };
  }
  if (kind === "eagle") {
    return {
      particleCount: 140,
      spread: 110,
      startVelocity: 45,
      scalar: 1.05,
      colors: ["#e9c349", "#a9cfbf", "#c5ebdb", "#ffe088"],
    };
  }
  return {
    particleCount: 80,
    spread: 80,
    startVelocity: 38,
    scalar: 0.95,
    colors: ["#a9cfbf", "#c5ebdb", "#e9c349"],
  };
}

async function fireConfetti(kind: ToastKind) {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    const cfg = confettiConfigFor(kind);
    // Shoot from just under the banner's resting position, slightly down-skewed
    // so particles fan outward and fall naturally.
    confetti({
      ...cfg,
      origin: { x: 0.5, y: 0.18 },
      ticks: 220,
      gravity: 0.9,
      disableForReducedMotion: true,
    });
    if (kind === "ace") {
      // Extra side blasts for aces
      setTimeout(() => {
        confetti({ ...cfg, particleCount: 80, angle: 60, origin: { x: 0, y: 0.5 } });
        confetti({ ...cfg, particleCount: 80, angle: 120, origin: { x: 1, y: 0.5 } });
      }, 180);
    }
  } catch {}
}

export default function ScoreToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const seededRef = useRef<Set<number>>(new Set());
  const toastIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function pushToast(playerName: string, hole: number, kind: ToastKind) {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, playerName, hole, kind, exiting: false }]);
      void fireConfetti(kind);
      // Start exit animation, then remove
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, EXIT_MS);
      }, VISIBLE_MS);
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
            pushToast(firstName(p.displayName), h + 1, kind);
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
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {toasts.map((t, i) => {
        const accent =
          t.kind === "ace"
            ? "border-yellow-400/70 bg-gradient-to-b from-yellow-500/25 via-surface-container-high/95 to-surface-container-high/95"
            : t.kind === "eagle"
            ? "border-primary/60 bg-gradient-to-b from-primary/25 via-surface-container-high/95 to-surface-container-high/95"
            : "border-secondary/60 bg-gradient-to-b from-secondary/20 via-surface-container-high/95 to-surface-container-high/95";
        const label =
          t.kind === "ace" ? "HOLE IN ONE" : t.kind === "eagle" ? "EAGLE" : "BIRDIE";
        const labelColor =
          t.kind === "ace"
            ? "text-yellow-300"
            : t.kind === "eagle"
            ? "text-primary"
            : "text-secondary";
        return (
          <div
            key={t.id}
            className={`fixed left-1/2 -translate-x-1/2 pointer-events-auto ${
              t.exiting ? "animate-score-banner-out" : "animate-score-banner-in"
            }`}
            style={{ top: `calc(env(safe-area-inset-top, 0px) + ${12 + i * 88}px)` }}
          >
            <div
              className={`backdrop-blur-xl border-2 rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 min-w-[300px] max-w-[92vw] ${accent}`}
            >
              <p
                className={`font-label text-[11px] font-bold uppercase tracking-[0.25em] text-center ${labelColor}`}
              >
                {label}
              </p>
              <p className="font-headline text-xl font-bold text-on-surface text-center mt-1 whitespace-nowrap">
                {t.playerName} just {verbFor(t.kind)} hole {t.hole}
                {t.kind === "ace" ? "!" : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
