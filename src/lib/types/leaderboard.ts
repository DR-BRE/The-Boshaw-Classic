export type LeaderboardRound = {
  round: number;
  course: string;
  strokes: number;
  toPar: number;
};

export type LeaderboardEntry = {
  rank: number;
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  group: number;
  handicap: number;
  totalToPar: number;
  totalStrokes: number;
  roundsPlayed: number;
  rounds: LeaderboardRound[];
};
