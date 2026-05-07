"use client";

import Image from "next/image";
import Countdown from "@/components/Countdown";
import Weather from "@/components/Weather";
import { TOURNAMENT } from "@/lib/tournament";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <div>
      {/* Hero — full-bleed: cancels the safe-area + button reservation that LayoutShell adds, then fills down to just above the bottom tab bar. */}
      <div
        className="relative w-full mb-4 overflow-hidden"
        style={{
          marginTop: "calc(-1 * (env(safe-area-inset-top, 0px) + 4rem))",
          height: "calc(100dvh - 56px)",
        }}
      >
        <Image
          src="/hero-bg.png"
          alt="The Boshaw Classic"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-x-0 px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
        >
          <Countdown />
        </div>
      </div>

      {/* Weather */}
      <Card className="mx-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            partly_cloudy_day
          </span>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Weather</h3>
        </div>
        <Weather />
      </Card>

      {/* Tee Times */}
      <Card noPadding className="mx-4 mb-4 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            schedule
          </span>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Tee Times</h3>
        </div>
        {TOURNAMENT.schedule.map((day) => (
          <div
            key={day.course}
            className="px-5 py-4 border-t border-outline-variant/30"
          >
            <div className="flex items-baseline justify-between mb-2">
              <p className="font-headline text-base font-semibold text-on-surface">{day.course}</p>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                {day.date}
              </p>
            </div>
            <div className="flex gap-2">
              {day.teeTimes.map((t) => (
                <div
                  key={t.group}
                  className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <span className="font-label text-xs font-semibold text-primary uppercase tracking-wider">
                    Group {t.group}
                  </span>
                  <span className="font-headline text-sm font-semibold text-on-surface tabular-nums">
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
