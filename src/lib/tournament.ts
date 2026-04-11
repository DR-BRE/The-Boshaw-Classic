export const TOURNAMENT = {
  name: "The Boshaw Classic",
  date: new Date("2026-05-14T08:00:00"),
  location: "Lake Chelan, WA",
  courses: ["Bear Mountain Ranch", "Desert Canyon", "Echo Falls"],
  playerCount: 8,
  groupCount: 2,
} as const;

export const COURSE_PARS = {
  "Bear Mountain Ranch": {
    total: 72,
    holes: [4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 5] as const,
    strokeIndex: [11, 13, 17, 9, 3, 7, 15, 1, 5, 6, 16, 10, 14, 8, 4, 12, 18, 2] as const,
    tee: "White",
    rating: 69.9,
    slope: 131,
  },
  "Desert Canyon": {
    total: 72,
    holes: [4, 4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 4, 4, 3, 5, 3, 4, 4] as const,
    strokeIndex: [13, 5, 9, 15, 3, 7, 1, 17, 11, 12, 10, 4, 8, 16, 2, 18, 14, 6] as const,
    tee: "White",
    rating: 70.7,
    slope: 127,
  },
  "Echo Falls": {
    total: 71,
    holes: [4, 4, 4, 5, 3, 5, 3, 4, 4, 3, 4, 5, 3, 3, 5, 4, 5, 3] as const,
    strokeIndex: [8, 12, 16, 4, 18, 2, 14, 10, 6, 17, 11, 3, 13, 15, 5, 7, 1, 9] as const,
    tee: "White",
    rating: 66.3,
    slope: 121,
  },
} as const;
