"use client";

interface ScoreCellProps {
  score: number | null;
  par: number;
  editable?: boolean;
  onClick?: () => void;
}

function getScoreStyle(score: number, par: number): string {
  if (score === 1) return "text-score-under bg-score-under/20 border-score-under/40 font-bold";
  if (score <= par - 2) return "text-score-under bg-score-under/15 border-score-under/30 font-bold";
  if (score === par - 1) return "text-primary bg-primary/15 border-primary/30 font-semibold";
  if (score === par) return "text-on-surface bg-surface-container border-outline-variant/40";
  return "text-score-over bg-score-over/10 border-score-over/30";
}

export function ScoreCell({ score, par, editable = false, onClick }: ScoreCellProps) {
  if (score === null) {
    return (
      <button
        onClick={onClick}
        disabled={!editable}
        className="w-10 h-10 rounded-lg border border-dashed border-outline-variant/40 flex items-center justify-center text-on-surface-variant/40 text-sm active:scale-90 transition-transform disabled:cursor-default cursor-pointer"
        aria-label={`Enter score for par ${par}`}
      >
        –
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!editable}
      className={[
        "w-10 h-10 rounded-lg border flex items-center justify-center text-sm tabular-nums transition-all",
        editable ? "active:scale-90 cursor-pointer" : "cursor-default",
        getScoreStyle(score, par),
      ].join(" ")}
      aria-label={`Score ${score} on par ${par}`}
    >
      {score}
    </button>
  );
}
