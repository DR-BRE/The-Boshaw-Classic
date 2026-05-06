"use client";

import Image from "next/image";
import Countdown from "@/components/Countdown";
import Weather from "@/components/Weather";
import { TOURNAMENT } from "@/lib/tournament";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="pb-28">
      {/* Hero — image as backdrop, countdown overlaid */}
      <div className="relative w-full mb-4">
        <Image
          src="/hero-bg.png"
          alt="The Boshaw Classic"
          width={940}
          height={1671}
          priority
          sizes="100vw"
          className="w-full h-auto object-contain"
          style={{ maxHeight: "85dvh" }}
        />
        <div className="absolute inset-x-0 bottom-4 px-4">
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
