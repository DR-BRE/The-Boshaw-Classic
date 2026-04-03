"use client";

export default function TripPage() {
  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="font-headline text-3xl text-on-surface mb-2">
        Trip Info
      </h2>
      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-6">
        Lake Chelan, WA — May 2026
      </p>

      {/* Placeholder — content coming soon */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center">
        <span
          className="material-symbols-outlined text-secondary text-4xl mb-3 block"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          luggage
        </span>
        <p className="font-headline text-lg text-on-surface mb-1">
          Trip details coming soon
        </p>
        <p className="text-xs text-on-surface-variant">
          Airbnb info, bars, restaurants, casino shuttle, and more
        </p>
      </div>
    </div>
  );
}
