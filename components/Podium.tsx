import React from 'react';
import { Team } from '../types';
import { TEAMS } from '../constants';

interface PodiumProps {
  championId?: string;
  runnerUpId?: string;
  secondRunnerUpId?: string;
  sportName: string;
  category: string;
}

const Podium: React.FC<PodiumProps> = ({ championId, runnerUpId, secondRunnerUpId, sportName, category }) => {
  const champion = TEAMS.find(t => t.id === championId);
  const runnerUp = TEAMS.find(t => t.id === runnerUpId);
  const third = TEAMS.find(t => t.id === secondRunnerUpId);

  const Stand = ({ team, rank, height, color }: { team?: Team, rank: number, height: string, color: string }) => (
    <div className="flex flex-col items-center justify-end w-1/3">
      {/* Avatar */}
      <div className={`mb-2 transition-all duration-700 transform ${team ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        {team ? (
           <div className="flex flex-col items-center">
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl md:text-4xl font-bold ${team.tailwindBg}`}>
                {team.name.split(' ')[0]}
              </div>
              <span className="mt-2 text-xs md:text-sm font-bold bg-white/80 px-2 py-1 rounded-md shadow-sm text-gray-800 whitespace-nowrap overflow-hidden max-w-full truncate">
                {team.name}
              </span>
           </div>
        ) : (
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse"></div>
        )}
      </div>

      {/* Box */}
      <div className={`w-full ${height} ${color} rounded-t-lg shadow-lg flex items-start justify-center pt-4 relative border-t border-white/20`}>
        <span className="text-white font-black text-4xl md:text-6xl drop-shadow-md opacity-80">{rank}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
        <h3 className="text-lg text-gray-500 font-medium">{sportName}</h3>
        <p className="text-blue-600 font-bold mb-8">{category}</p>
        
        <div className="flex items-end justify-center h-64 md:h-80 gap-2 md:gap-4 px-2">
            <Stand team={runnerUp} rank={2} height="h-32 md:h-40" color="bg-gray-400" />
            <Stand team={champion} rank={1} height="h-44 md:h-56" color="bg-yellow-400" />
            <Stand team={third} rank={3} height="h-24 md:h-28" color="bg-orange-400" />
        </div>

        {!champion && (
            <p className="text-gray-400 mt-6 text-sm">ยังไม่สรุปผลการแข่งขัน</p>
        )}
    </div>
  );
};

export default Podium;