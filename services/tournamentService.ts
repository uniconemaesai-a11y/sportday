
import { SportConfig, SportTournament, Match, Team } from '../types';
import { TEAMS } from '../constants';

// Spreadsheet Configuration
const STORAGE_KEY = 'sports_day_data_2568';

// --- CONFIGURATION ---
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCohABk3bF41ix8GCpZFGD774KyU9YS8uXjK6gRp0BYITr1nU3FUay8IPdrk3HKe-EdQ/exec'; 
// ---------------------

export const saveToLocal = (data: Record<string, SportTournament>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed", e);
  }
};

export const loadFromLocal = (): Record<string, SportTournament> | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const fetchFromSheets = async (): Promise<any[]> => {
  try {
    if (GOOGLE_SCRIPT_URL) {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const json = await response.json();
        if (json.status === 'success') {
            return json.data;
        }
        return [];
    }
    return [];
  } catch (error) {
    console.warn("Fetch failed", error);
    return [];
  }
};

export const saveToCloud = async (matches: Match[]) => {
    if (!GOOGLE_SCRIPT_URL) return;
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matches)
        });
    } catch (e) {
        console.error("Failed to save to cloud", e);
    }
};

const shuffleTeams = (teams: Team[]): Team[] => {
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper to get fixed teams for specific sports
export const getFixedTeamPairings = (sportId: string) => {
  if (sportId === 's5') { // แชร์บอล 8 ปี ชาย
    return { a1: 't4', b1: 't3', a2: 't2', b2: 't1' }; // ม่วง พบ ชมพู, เขียว พบ แดง
  }
  if (sportId === 's9') { // วอลเลย์บอล ชาย
    return { a1: 't4', b1: 't2', a2: 't3', b2: 't1' }; // ม่วง พบ เขียว, ชมพู พบ แดง
  }
  if (sportId === 's10') { // วอลเลย์บอล หญิง
    return { a1: 't2', b1: 't1', a2: 't3', b2: 't4' }; // เขียว พบ แดง, ชมพู พบ ม่วง
  }
  return null;
};

export const initializeTournament = (sport: SportConfig): SportTournament => {
  let teamA1, teamB1, teamA2, teamB2;

  const fixed = getFixedTeamPairings(sport.id);
  if (fixed) {
    teamA1 = fixed.a1; teamB1 = fixed.b1;
    teamA2 = fixed.a2; teamB2 = fixed.b2;
  } else {
    const randomTeams = shuffleTeams(TEAMS);
    teamA1 = randomTeams[0].id;
    teamB1 = randomTeams[1].id;
    teamA2 = randomTeams[2].id;
    teamB2 = randomTeams[3].id;
  }

  const semi1Id = `m_${sport.id}_s1`;
  const semi2Id = `m_${sport.id}_s2`;
  const thirdId = `m_${sport.id}_3rd`;
  const finalId = `m_${sport.id}_fin`;

  const semiFinal1: Match = {
    id: semi1Id,
    sportId: sport.id,
    round: 'semi',
    teamAId: teamA1,
    teamBId: teamB1,
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled'
  };

  const semiFinal2: Match = {
    id: semi2Id,
    sportId: sport.id,
    round: 'semi',
    teamAId: teamA2,
    teamBId: teamB2,
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled'
  };

  const thirdPlace: Match = {
    id: thirdId,
    sportId: sport.id,
    round: 'third_place',
    teamAId: undefined,
    teamBId: undefined,
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled'
  };

  const finalMatch: Match = {
    id: finalId,
    sportId: sport.id,
    round: 'final',
    teamAId: undefined,
    teamBId: undefined,
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled'
  };

  return {
    sportConfig: sport,
    matches: [semiFinal1, semiFinal2, thirdPlace, finalMatch]
  };
};

export const updateTournamentMatch = (tournament: SportTournament, updatedMatch: Match): SportTournament => {
  const matches = tournament.matches.map(m => m.id === updatedMatch.id ? { ...updatedMatch } : { ...m });
  
  const semi1 = matches.find(m => m.round === 'semi' && m.id.endsWith('s1'));
  const semi2 = matches.find(m => m.round === 'semi' && m.id.endsWith('s2'));
  const third = matches.find(m => m.round === 'third_place');
  const final = matches.find(m => m.round === 'final');

  if (!semi1 || !semi2 || !third || !final) return tournament;

  if (semi1.status === 'finished' && semi1.winnerId) {
    const loserId = semi1.teamAId === semi1.winnerId ? semi1.teamBId : semi1.teamAId;
    final.teamAId = semi1.winnerId;
    third.teamAId = loserId;
  }

  if (semi2.status === 'finished' && semi2.winnerId) {
    const loserId = semi2.teamAId === semi2.winnerId ? semi2.teamBId : semi2.teamAId;
    final.teamBId = semi2.winnerId;
    third.teamBId = loserId;
  }

  let championId, runnerUpId, secondRunnerUpId;

  if (final.status === 'finished') {
    championId = final.winnerId;
    runnerUpId = final.teamAId === final.winnerId ? final.teamBId : final.teamAId;
  }

  if (third.status === 'finished') {
    secondRunnerUpId = third.winnerId;
  }

  return {
    ...tournament,
    matches: matches,
    championId,
    runnerUpId,
    secondRunnerUpId
  };
};

export const mergeSheetData = (currentData: Record<string, SportTournament>, sheetRows: any[]): Record<string, SportTournament> => {
    if (!sheetRows || sheetRows.length === 0) return currentData;

    const newData = { ...currentData };
    
    sheetRows.forEach(row => {
        const sportId = row.sportId;
        if (newData[sportId]) {
            const matchIndex = newData[sportId].matches.findIndex(m => m.id === row.id);
            if (matchIndex !== -1) {
                const match = newData[sportId].matches[matchIndex];
                
                // Allow fixed teams to be enforced even if row data is empty for semi finals
                const fixed = getFixedTeamPairings(sportId);
                let rowTeamAId = (row.teamAId === 'undefined' || row.teamAId === '') ? undefined : row.teamAId;
                let rowTeamBId = (row.teamBId === 'undefined' || row.teamBId === '') ? undefined : row.teamBId;
                
                if (fixed && match.round === 'semi' && !rowTeamAId && !rowTeamBId) {
                    if (match.id.endsWith('s1')) {
                        rowTeamAId = fixed.a1;
                        rowTeamBId = fixed.b1;
                    } else if (match.id.endsWith('s2')) {
                        rowTeamAId = fixed.a2;
                        rowTeamBId = fixed.b2;
                    }
                }

                const isDifferent = 
                    match.status !== row.status || 
                    match.scoreA !== parseInt(row.scoreA) || 
                    match.scoreB !== parseInt(row.scoreB) ||
                    match.winnerId !== (row.winnerId === 'undefined' || row.winnerId === '' ? undefined : row.winnerId) ||
                    match.teamAId !== rowTeamAId ||
                    match.teamBId !== rowTeamBId;

                if (isDifferent) {
                     const updatedMatch: Match = {
                         ...match,
                         scoreA: parseInt(row.scoreA || '0'),
                         scoreB: parseInt(row.scoreB || '0'),
                         status: row.status as any,
                         winnerId: row.winnerId === 'undefined' || row.winnerId === '' ? undefined : row.winnerId,
                         teamAId: rowTeamAId,
                         teamBId: rowTeamBId
                     };
                     newData[sportId] = updateTournamentMatch(newData[sportId], updatedMatch);
                }
            }
        }
    });
    
    return newData;
};
