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

      {/* Accommodation Card */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
        <div className="bg-secondary px-4 py-2">
          <h3 className="font-headline text-on-secondary text-sm font-bold uppercase tracking-wider">
            Accommodation
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Property Name */}
          <div>
            <p className="font-headline text-lg text-on-surface font-bold">
              Large Home with Pool, HotTub & Sweeping Lake Views
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-secondary text-sm">star</span>
              <span className="font-label text-xs text-on-surface-variant">
                4.97 (126 reviews)
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-secondary text-xl mt-0.5"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              location_on
            </span>
            <div>
              <p className="font-label text-sm text-on-surface">
                2031 Lakeshore Drive
              </p>
              <p className="font-label text-xs text-on-surface-variant">
                Manson, WA 98831
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-secondary text-xl mt-0.5"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              calendar_today
            </span>
            <div>
              <p className="font-label text-sm text-on-surface">
                May 14 – 17, 2026
              </p>
              <p className="font-label text-xs text-on-surface-variant">
                3 nights
              </p>
            </div>
          </div>

          {/* Bedrooms / Bathrooms */}
          <div className="flex gap-6">
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined text-secondary text-xl mt-0.5"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                bed
              </span>
              <div>
                <p className="font-label text-sm text-on-surface">4 Bedrooms</p>
                <p className="font-label text-xs text-on-surface-variant">
                  3 upstairs + 1 basement w/ bunks
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined text-secondary text-xl mt-0.5"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                bathroom
              </span>
              <div>
                <p className="font-label text-sm text-on-surface">2 Bathrooms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
        <div className="bg-secondary px-4 py-2">
          <h3 className="font-headline text-on-secondary text-sm font-bold uppercase tracking-wider">
            Amenities
          </h3>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { icon: "pool", label: "Pool" },
            { icon: "hot_tub", label: "Hot Tub" },
            { icon: "wifi", label: "Fast WiFi" },
            { icon: "local_parking", label: "Free Parking" },
            { icon: "sports_esports", label: "Game Console" },
            { icon: "tv", label: "Smart TVs" },
            { icon: "sports_soccer", label: "Foosball" },
            { icon: "sports_tennis", label: "Ping Pong" },
            { icon: "spa", label: "Community Sauna" },
            { icon: "water", label: "Near the Lake" },
          ].map((a) => (
            <div key={a.label} className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-secondary text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                {a.icon}
              </span>
              <span className="font-label text-sm text-on-surface">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Airbnb Link */}
      <a
        href="https://www.airbnb.com/rooms/44479675"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-secondary text-on-secondary font-headline text-sm font-bold uppercase tracking-wider text-center py-3 rounded-xl active:scale-95 transition-transform"
      >
        View on Airbnb
      </a>
    </div>
  );
}
