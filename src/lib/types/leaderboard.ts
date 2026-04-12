export type LeaderboardRound = {
  round: number;
  course: string;
  strokes: number | null;
  toPar: number | null;
};

export type LeaderboardEntry = {
  rank: number;
  playerId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  group: number;
  handicap: number;
  totalToPar: number;
  totalStrokes: number;
  roundsPlayed: number;
  rounds: LeaderboardRound[];
};
