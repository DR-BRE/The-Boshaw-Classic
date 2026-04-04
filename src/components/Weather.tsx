"use client";

import { useEffect, useState } from "react";

// Lake Chelan, WA coordinates
const LAT = 47.84;
const LON = -120.02;

type DayForecast = {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
};

function weatherIcon(code: number): string {
  if (code === 0) return "clear_day";
  if (code <= 3) return "partly_cloudy_day";
  if (code <= 48) return "foggy";
  if (code <= 55) return "rainy";
  if (code <= 65) return "rainy";
  if (code <= 67) return "weather_mix";
  if (code <= 75) return "weather_snowy";
  if (code <= 77) return "grain";
  if (code <= 82) return "rainy";
  if (code <= 86) return "weather_snowy";
  return "thunderstorm";
}

function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing Rain";
  if (code <= 75) return "Snow";
  if (code <= 77) return "Sleet";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow Showers";
  return "Thunderstorm";
}

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export default function Weather() {
  const [forecast, setForecast] = useState<DayForecast[]>([]);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=celsius&timezone=America/Los_Angeles&forecast_days=5`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.daily) return;
        const days: DayForecast[] = data.daily.time.map(
          (date: string, i: number) => ({
            date,
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            weatherCode: data.daily.weather_code[i],
          })
        );
        setForecast(days);
      })
      .catch(() => {});
  }, []);

  if (forecast.length === 0) return null;

  return (
    <div className="bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary text-lg">
          location_on
        </span>
        <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
          Lake Chelan, WA
        </span>
      </div>

      <div className="flex gap-1">
        {forecast.map((day) => {
          const dayName = new Date(day.date + "T12:00:00").toLocaleDateString(
            "en-US",
            { weekday: "short" }
          );
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 py-2"
            >
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                {dayName}
              </span>
              <span
                className="material-symbols-outlined text-on-surface text-xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                {weatherIcon(day.weatherCode)}
              </span>
              <span className="font-label text-xs font-bold text-on-surface">
                {cToF(day.tempMax)}°
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">
                {cToF(day.tempMin)}°
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-on-surface-variant text-center mt-2">
        {weatherLabel(forecast[0].weatherCode)} · {cToF(forecast[0].tempMax)}°F high today
      </p>
    </div>
  );
}
