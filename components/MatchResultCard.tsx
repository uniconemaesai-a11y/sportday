import React from 'react';
import { Match, SportConfig } from '../types';
import { TEAMS, getIcon } from '../constants';
import { Trophy } from 'lucide-react';

interface MatchResultCardProps {
  match: Match;
  sportConfig: SportConfig;
}

const MatchResultCard: React.FC<MatchResultCardProps> = ({ match, sportConfig }) => {
  const teamA = TEAMS.find(t => t.id === match.teamAId);
  const teamB = TEAMS.find(t => t.id === match.teamBId);
  
  if (!teamA || !teamB) return null;

  const isWinnerA = match.winnerId === teamA.id;
  const isWinnerB = match.winnerId === teamB.id;

  const getRoundName = (r: string) => {
      switch(r) {
          case 'semi': return 'รอบรองฯ';
          case 'third_place': return 'ชิงที่ 3';
          case 'final': return 'ชิงชนะเลิศ';
          default: return r;
      }
  };
  
  const getRoundStyle = (r: string) => {
      switch(r) {
          case 'final': return 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-yellow-100';
          case 'third_place': return 'bg-orange-100 text-orange-700 border-orange-200 shadow-orange-100';
          default: return 'bg-purple-100 text-purple-600 border-purple-200 shadow-purple-100';
      }
  };

  return (
    <div className="relative bg-white rounded-[24px] shadow-sm border-2 border-white hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group mb-3">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 via-cyan-50 to-transparent rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
        
        <div className="relative p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 md:gap-4">
            
            {/* Left: Sport Info & Badge */}
            <div className="flex items-center justify-between w-full md:w-auto md:min-w-[180px] gap-3">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-blue-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] ring-4 ring-white">
                        {getIcon(sportConfig.iconName, 24)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-700 text-sm md:text-base leading-tight group-hover:text-blue-600 transition-colors">{sportConfig.name}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-gray-100">
                            {sportConfig.category}
                        </span>
                    </div>
                 </div>
                 
                 {/* Mobile Badge (Shown on top right) */}
                 <div className="md:hidden">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getRoundStyle(match.round)}`}>
                        {getRoundName(match.round)}
                    </span>
                 </div>
            </div>

            {/* Divider (Mobile only) */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent md:hidden"></div>

            {/* Center: Matchup & Score */}
            <div className="flex-grow w-full flex items-center justify-between md:justify-center bg-slate-50/50 rounded-2xl p-2 md:px-6 md:py-3 relative border border-slate-100">
                
                {/* Team A */}
                <div className={`flex items-center gap-2 md:gap-3 flex-1 justify-end transition-opacity duration-300 ${isWinnerA ? 'opacity-100' : 'opacity-60 grayscale-[0.3]'}`}>
                    <span className={`text-xs md:text-sm font-bold text-right hidden sm:block ${isWinnerA ? 'text-gray-800' : 'text-gray-500'}`}>
                        {teamA.name.split(' ')[0]}
                    </span>
                    <div className="relative group/team">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white ${teamA.tailwindBg}`}>
                             {teamA.name.split('(')[0].replace('สี','').substring(0,1)}
                        </div>
                        {isWinnerA && <div className="absolute -top-2 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border-2 border-white shadow-sm animate-bounce-small"><Trophy size={10} /></div>}
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 whitespace-nowrap opacity-0 group-hover/team:opacity-100 transition-opacity sm:hidden bg-white px-1 rounded shadow-sm">
                             {teamA.name.split(' ')[0]}
                        </div>
                    </div>
                </div>

                {/* Score */}
                <div className="mx-3 md:mx-6 flex flex-col items-center z-10">
                    <div className="flex items-center gap-1 font-black text-xl md:text-3xl tracking-tighter text-gray-700 bg-white px-3 md:px-5 py-1 md:py-1.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 transform group-hover:scale-105 transition-transform">
                        <span className={isWinnerA ? 'text-blue-600 drop-shadow-sm' : 'text-gray-300'}>{match.scoreA}</span>
                        <span className="text-gray-200 text-base md:text-lg mx-0.5">:</span>
                        <span className={isWinnerB ? 'text-blue-600 drop-shadow-sm' : 'text-gray-300'}>{match.scoreB}</span>
                    </div>
                </div>

                {/* Team B */}
                <div className={`flex items-center gap-2 md:gap-3 flex-1 justify-start transition-opacity duration-300 ${isWinnerB ? 'opacity-100' : 'opacity-60 grayscale-[0.3]'}`}>
                     <div className="relative group/team">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white ${teamB.tailwindBg}`}>
                             {teamB.name.split('(')[0].replace('สี','').substring(0,1)}
                        </div>
                        {isWinnerB && <div className="absolute -top-2 -left-1 bg-yellow-400 text-white rounded-full p-0.5 border-2 border-white shadow-sm animate-bounce-small"><Trophy size={10} /></div>}
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 whitespace-nowrap opacity-0 group-hover/team:opacity-100 transition-opacity sm:hidden bg-white px-1 rounded shadow-sm">
                             {teamB.name.split(' ')[0]}
                        </div>
                    </div>
                    <span className={`text-xs md:text-sm font-bold text-left hidden sm:block ${isWinnerB ? 'text-gray-800' : 'text-gray-500'}`}>
                        {teamB.name.split(' ')[0]}
                    </span>
                </div>
            </div>

            {/* Right: Round Badge (Desktop) */}
             <div className="hidden md:flex justify-end min-w-[80px]">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${getRoundStyle(match.round)}`}>
                    {getRoundName(match.round)}
                 </span>
            </div>

        </div>
    </div>
  );
};
export default MatchResultCard;