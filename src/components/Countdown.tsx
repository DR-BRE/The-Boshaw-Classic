"use client";

import { useEffect, useState } from "react";
import { TOURNAMENT } from "@/lib/tournament";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft | "live" | "over" {
  const now = new Date().getTime();
  const target = TOURNAMENT.date.getTime();
  const diff = target - now;

  if (diff <= 0) {
    const hoursAfter = -diff / (1000 * 60 * 60);
    if (hoursAfter < 12) return "live";
    return "over";
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-xl w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-headline font-bold text-secondary tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | "live" | "over">(
    getTimeLeft()
  );

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (timeLeft === "live") {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary-container border border-primary/20 rounded-full px-6 py-3">
          <span className="material-symbols-outlined text-secondary animate-pulse">
            sports_golf
          </span>
          <span className="text-secondary text-sm font-label font-bold uppercase tracking-widest">
            Tournament In Progress
          </span>
        </div>
      </div>
    );
  }

  if (timeLeft === "over") {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-secondary-container/20 rounded-full px-6 py-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            trophy
          </span>
          <span className="text-secondary text-sm font-label font-bold uppercase tracking-widest">
            Tournament Complete
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
