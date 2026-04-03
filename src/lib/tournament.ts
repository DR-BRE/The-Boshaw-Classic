export const TOURNAMENT = {
  name: "The Boshaw Classic",
  date: new Date("2026-05-14T08:00:00"),
  location: "Lake Chelan, WA",
  courses: ["Bear Mountain Ranch", "Desert Canyon"],
  playerCount: 8,
  groupCount: 2,
} as const;

export const COURSE_PARS = {
  "Bear Mountain Ranch": {
    total: 72,
    holes: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4] as const,
  },
  "Desert Canyon": {
    total: 73,
    holes: [4, 4, 5, 3, 4, 4, 5, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 4] as const,
  },
} as const;
