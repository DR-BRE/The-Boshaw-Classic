"use client";

import { useSession } from "next-auth/react";

export default function TripPage() {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="font-headline text-3xl text-on-surface mb-2">
        Trip Info
      </h2>
      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-6">
        Lake Chelan, WA — May 2026
      </p>

      {!session ? (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-3 block">lock</span>
          <p className="font-headline text-lg text-on-surface mb-1">Sign in to view trip details</p>
          <p className="font-label text-sm text-on-surface-variant">
            Accommodation info, amenities, and more are available once you're signed in.
          </p>
        </div>
      ) : (
      <>
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
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl active:scale-95 transition-transform font-headline text-sm font-bold tracking-wider text-white"
        style={{ backgroundColor: "#FF5A5F" }}
      >
        <svg viewBox="0 0 64 64" width="20" height="20" fill="white">
          <path d="M60.9 45.487l-.966-2.305-1.475-3.27-.062-.062a661.83 661.83 0 0 0-14.15-28.957l-.198-.384-1.524-3.073a18.4 18.4 0 0 0-2.305-3.52A10.35 10.35 0 0 0 32.027 0a10.76 10.76 0 0 0-8.203 3.84 22.1 22.1 0 0 0-2.305 3.52l-1.735 3.395c-4.956 9.615-9.74 19.342-14.163 28.957l-.062.124c-.384 1.053-.892 2.13-1.413 3.284-.322.702-.644 1.47-.966 2.305a14.4 14.4 0 0 0-.768 6.914 13.63 13.63 0 0 0 8.327 10.631 13.16 13.16 0 0 0 5.192 1.028 14.57 14.57 0 0 0 1.66-.124 16.93 16.93 0 0 0 6.406-2.18 32.44 32.44 0 0 0 7.943-6.666 33.62 33.62 0 0 0 7.943 6.666 16.92 16.92 0 0 0 6.406 2.18c.55.073 1.105.114 1.66.124 1.783.018 3.55-.332 5.192-1.028a13.63 13.63 0 0 0 8.327-10.631 12.11 12.11 0 0 0-.582-6.852zM32.026 48.82c-3.457-4.362-5.7-8.45-6.468-11.92-.314-1.277-.38-2.6-.198-3.903.127-.965.48-1.886 1.028-2.7a6.79 6.79 0 0 1 5.638-2.825c2.236-.086 4.362.974 5.638 2.813a6.17 6.17 0 0 1 1.028 2.69 10.3 10.3 0 0 1-.198 3.903c-.768 3.395-3 7.435-6.468 11.92zm25.562 3c-.5 3.337-2.7 6.166-5.836 7.435a9.7 9.7 0 0 1-4.857.706 12.6 12.6 0 0 1-4.87-1.66 29.91 29.91 0 0 1-7.298-6.195c4.225-5.192 6.8-9.913 7.757-14.163a16.11 16.11 0 0 0 .322-5.452c-.238-1.567-.832-3.06-1.735-4.362-2.062-2.942-5.453-4.666-9.045-4.597-3.572-.046-6.942 1.65-9.033 4.547-.903 1.303-1.497 2.794-1.735 4.362a13.31 13.31 0 0 0 .322 5.452c.966 4.225 3.593 9.033 7.757 14.225a28.79 28.79 0 0 1-7.298 6.195 12.6 12.6 0 0 1-4.882 1.71 10.26 10.26 0 0 1-4.87-.644C9.16 58.12 6.94 55.292 6.45 51.954a10.61 10.61 0 0 1 .582-4.956c.198-.644.508-1.24.83-2.044.446-1.028.966-2.12 1.475-3.2l.062-.124c4.424-9.54 9.157-19.28 14.1-28.772l.186-.458 1.536-2.95a14.05 14.05 0 0 1 1.846-2.838 6.73 6.73 0 0 1 10.247 0 13.87 13.87 0 0 1 1.747 2.813l1.536 2.95.186.384c4.87 9.553 9.628 19.28 14.04 28.834v.062c.508 1.028.966 2.18 1.475 3.2.322.768.644 1.413.83 2.044a10.81 10.81 0 0 1 .446 4.956z" fillRule="evenodd" />
        </svg>
        View on Airbnb
      </a>
      </>
      )}
    </div>
  );
}
