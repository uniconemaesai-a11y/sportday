// Data Models

export type TeamColor = 'red' | 'green' | 'pink' | 'purple';

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  colorHex: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  score: number; // Total accumulated score for the team
}

export type SportType = 
  | 'football' 
  | 'handball' 
  | 'chairball' 
  | 'volleyball' 
  | 'futsal' 
  | 'tugofwar' 
  | 'petanque' 
  | 'badminton' 
  | 'chess' 
  | 'checkers';

export interface SportConfig {
  id: string;
  name: string;
  type: SportType;
  category: string; // e.g., รุ่นอายุ 10 ปี ชาย
  iconName: string;
}

export type MatchStatus = 'scheduled' | 'playing' | 'finished';

export type RoundType = 'semi' | 'third_place' | 'final';

export interface Match {
  id: string;
  sportId: string;
  round: RoundType;
  teamAId?: string; // Can be undefined if waiting for previous match
  teamBId?: string;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: MatchStatus;
}

export interface SportTournament {
  sportConfig: SportConfig;
  matches: Match[]; // Should contain 4 matches (2 semi, 1 third, 1 final)
  championId?: string;
  runnerUpId?: string;
  secondRunnerUpId?: string;
}