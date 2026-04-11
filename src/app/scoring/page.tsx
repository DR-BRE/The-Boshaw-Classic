"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { TOURNAMENT, COURSE_PARS } from "@/lib/tournament";

const ROUND_COURSES: Record<number, string> = {
  1: TOURNAMENT.courses[0],
  2: TOURNAMENT.courses[1],
  3: TOURNAMENT.courses[2],
};

function scoreColor(score: number, par: number) {
  if (score < par) return "text-primary";
  if (score > par) return "text-on-error-container";
  return "text-on-surface";
}

function scoreBg(score: number, par: number) {
  if (score < par) return "bg-primary/15 border-primary/30";
  if (score > par) return "bg-on-error-container/10 border-on-error-container/30";
  return "bg-surface-container-high border-outline-variant/30";
}

function scoreLabel(score: number, par: number) {
  const diff = score - par;
  if (score === 1) return "Beers on you!";
  if (diff <= -2) return "Eagle!";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  return `+${diff}`;
}

function scoreLabelColor(score: number, par: number) {
  const diff = score - par;
  if (diff < 0) return "text-primary";
  if (diff === 0) return "text-on-surface-variant";
  return "text-on-error-container";
}

// ─── Card View ─────────────────────────────────────────

function CardView({
  holes,
  pars,
  currentHole,
  setCurrentHole,
  onScoreChange,
}: {
  holes: number[];
  pars: readonly number[];
  currentHole: number;
  setCurrentHole: (h: number) => void;
  onScoreChange: (hole: number, score: number) => void;
}) {
  const par = pars[currentHole];
  const score = holes[currentHole];
  const isFirst = currentHole === 0;
  const isLast = currentHole === 17;

  return (
    <div>
      {/* Hole Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {Array.from({ length: 18 }, (_, i) => {
          const filled = holes[i] > 0;
          const active = i === currentHole;
          return (
            <button
              key={i}
              onClick={() => setCurrentHole(i)}
              className={`flex-shrink-0 w-9 h-9 rounded-lg font-label text-xs font-bold transition-all active:scale-90 ${
                active
                  ? "bg-secondary text-on-secondary"
                  : filled
                    ? "bg-primary-container text-primary"
                    : "bg-white/[0.06] text-on-surface-variant"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Score Card */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-4">
        {/* Hole Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {currentHole < 9 ? "Front 9" : "Back 9"}
            </p>
            <h3 className="font-headline text-3xl text-on-surface">
              Hole {currentHole + 1}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Par
            </p>
            <p className="font-headline text-3xl text-secondary">{par}</p>
          </div>
        </div>

        {/* Score Input */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={() => score > 1 && onScoreChange(currentHole, score - 1)}
            disabled={score <= 1}
            className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface">
              remove
            </span>
          </button>

          <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreBg(score, par)}`}>
            <span className={`font-headline text-4xl font-bold tabular-nums ${scoreColor(score, par)}`}>
              {score}
            </span>
          </div>

          <button
            onClick={() => score < 15 && onScoreChange(currentHole, score + 1)}
            disabled={score >= 15}
            className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface">
              add
            </span>
          </button>
        </div>

        {/* Score Label */}
        <p className={`text-center font-label text-sm font-bold uppercase tracking-wider ${scoreLabelColor(score, par)}`}>
          {scoreLabel(score, par)}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => !isFirst && setCurrentHole(currentHole - 1)}
          disabled={isFirst}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] font-label font-bold text-sm uppercase tracking-wider text-on-surface disabled:opacity-30 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Prev
        </button>
        <button
          onClick={() => !isLast && setCurrentHole(currentHole + 1)}
          disabled={isLast}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] font-label font-bold text-sm uppercase tracking-wider text-on-surface disabled:opacity-30 active:scale-95 transition-transform"
        >
          Next
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────

export default function ScoringPage() {
  const { data: session, status } = useSession();
  const [round, setRound] = useState(1);
  const [holes, setHoles] = useState<number[]>([]);
  const [currentHole, setCurrentHole] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  const courseName = ROUND_COURSES[round];
  const courseKey = courseName as keyof typeof COURSE_PARS;
  const pars = COURSE_PARS[courseKey].holes;
  const coursePar = COURSE_PARS[courseKey].total;

  // Initialize holes with par values
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch(`/api/scores?round=${round}`)
      .then((res) => {
        if (res.status === 404) {
          setHasProfile(false);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setHasProfile(true);
        if (data.score) {
          const existing = Array.from({ length: 18 }, (_, i) =>
            (data.score as Record<string, number>)[`hole${i + 1}`]
          );
          setHoles(existing);
        } else {
          setHoles([...pars]);
        }
        setLoading(false);
      })
      .catch(() => {
        setHoles([...pars]);
        setLoading(false);
      });
  }, [status, round]);

  function handleScoreChange(holeIndex: number, score: number) {
    setHoles((prev) => {
      const next = [...prev];
      next[holeIndex] = score;
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round, holes }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  const totalStrokes = holes.reduce((sum, s) => sum + s, 0);
  const toPar = totalStrokes - coursePar;

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-2">Enter Score</h2>
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 text-center mt-4">
          <span className="material-symbols-outlined text-secondary text-4xl mb-3" style={{ fontVariationSettings: '"FILL" 1' }}>
            edit_note
          </span>
          <p className="font-headline text-lg text-on-surface mb-1">Sign in to enter scores</p>
          <p className="text-xs text-on-surface-variant mb-6">Track your scores hole by hole during the tournament</p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-label font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >
            Sign In
            <span className="material-symbols-outlined text-lg">login</span>
          </Link>
        </div>
      </div>
    );
  }

  // No profile
  if (!loading && !hasProfile) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-2">Enter Score</h2>
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 text-center mt-4">
          <span className="material-symbols-outlined text-secondary text-4xl mb-3" style={{ fontVariationSettings: '"FILL" 1' }}>
            person_add
          </span>
          <p className="font-headline text-lg text-on-surface mb-1">Set up your profile first</p>
          <p className="text-xs text-on-surface-variant mb-6">Create a player profile to start entering scores</p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-label font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >
            Create Profile
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || status === "loading") {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-6">Enter Score</h2>
        <div className="space-y-4">
          <div className="bg-white/[0.06] animate-pulse rounded-xl h-12" />
          <div className="bg-white/[0.06] animate-pulse rounded-xl h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h2 className="font-headline text-3xl text-on-surface mb-5">Enter Score</h2>

      {/* Round Tabs */}
      <div className="bg-white/[0.06] backdrop-blur-lg border border-white/[0.06] rounded-xl p-1 flex gap-1 mb-4">
        {[1, 2, 3].map((r) => (
          <button
            key={r}
            onClick={() => { setRound(r); setCurrentHole(0); setLoading(true); }}
            className={`flex-1 py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
              round === r
                ? "bg-white/[0.1] text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Round {r}
          </button>
        ))}
      </div>

      {/* Course Info */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-headline text-base text-on-surface">{courseName}</h3>
          <p className="font-label text-xs text-on-surface-variant">Par {coursePar}</p>
        </div>
        <span className="text-xs font-label text-primary uppercase tracking-widest bg-primary-container px-3 py-1 rounded-full">
          Round {round}
        </span>
      </div>

      {/* Score Entry */}
      <CardView
        holes={holes}
        pars={pars}
        currentHole={currentHole}
        setCurrentHole={setCurrentHole}
        onScoreChange={handleScoreChange}
      />

      {/* Score Summary Bar */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 mt-5 flex items-center justify-between">
        <div>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Total</p>
          <p className="font-headline text-2xl text-on-surface tabular-nums">{totalStrokes}</p>
        </div>
        <div className="text-center">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">To Par</p>
          <p className={`font-headline text-2xl font-bold tabular-nums ${
            toPar < 0 ? "text-primary" : toPar > 0 ? "text-on-error-container" : "text-on-surface"
          }`}>
            {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
          </p>
        </div>
        <div className="text-right">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Thru</p>
          <p className="font-headline text-2xl text-on-surface tabular-nums">18</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary font-label font-bold uppercase tracking-widest text-sm py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Score"}
        <span className="material-symbols-outlined text-lg">
          {saved ? "check" : "save"}
        </span>
      </button>
    </div>
  );
}
