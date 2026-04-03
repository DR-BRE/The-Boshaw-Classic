export interface ScorecardPlayer {
  id: string;
  displayName: string;
  handicap: number;
  group: number;
  scores: (number | null)[];
  front9: number | null;
  back9: number | null;
  gross: number | null;
  net: number | null;
}

export interface ScorecardCourse {
  name: string;
  par: number;
  holes: number[];
}

export interface ScorecardData {
  course: ScorecardCourse;
  players: ScorecardPlayer[];
}
