"use client";

import { useEffect, useState } from "react";
import { TOURNAMENT } from "@/lib/tournament";
import { Badge } from "@/components/ui";

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
    <div className="flex flex-col items-center gap-1">
      <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl px-4 py-3 min-w-[64px] text-center">
        <span className="font-display text-4xl text-on-surface tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
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
      <div className="flex justify-center">
        <Badge variant="live">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Live
        </Badge>
      </div>
    );
  }

  if (timeLeft === "over") {
    return (
      <div className="flex justify-center">
        <Badge variant="gold">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            trophy
          </span>
          Tournament Complete
        </Badge>
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
