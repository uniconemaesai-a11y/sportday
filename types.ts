
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
  | 'checkers'
  | 'athletics'; // ประเภทกรีฑาและกีฬาเด็กเล็ก

export interface SportConfig {
  id: string;
  name: string;
  type: SportType;
  category: string; // e.g., รุ่นอายุ 10 ปี ชาย
  iconName: string;
}

export type MatchStatus = 'scheduled' | 'playing' | 'finished';

export type RoundType = 'semi' | 'third_place' | 'final' | 'direct';

export interface Match {
  id: string;
  sportId: string;
  round: RoundType;
  teamAId?: string; 
  teamBId?: string;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: MatchStatus;
}

export interface SportTournament {
  sportConfig: SportConfig;
  matches: Match[]; 
  championId?: string;
  runnerUpId?: string;
  secondRunnerUpId?: string;
}
