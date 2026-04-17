"use client";

import { useEffect, useState } from "react";
import { TOURNAMENT } from "@/lib/tournament";

/**
 * Returns true when the current time falls inside any day's active window
 * (from the day's tee time through activeWindowHours later). Ticks every 60s.
 */
export function useLiveRound(): boolean {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const windowMs = TOURNAMENT.activeWindowHours * 60 * 60 * 1000;

    function check() {
      const now = Date.now();
      const anyLive = TOURNAMENT.schedule.some((d) => {
        if (!d.activeStartISO) return false;
        const start = new Date(d.activeStartISO).getTime();
        return now >= start && now < start + windowMs;
      });
      setLive(anyLive);
    }

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return live;
}
