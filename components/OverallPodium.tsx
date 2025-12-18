
import React from 'react';
import { Team } from '../types';
import { Trophy, Medal, Star, Crown, Sparkles, Activity, Timer } from 'lucide-react';

interface Standing {
  team: Team;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  sportsPoints: number;
  athleticsPoints: number;
  points: number;
}

interface OverallPodiumProps {
  standings: Standing[];
}

const OverallPodium: React.FC<OverallPodiumProps> = ({ standings }) => {
  const rank1 = standings[0];
  const rank2 = standings[1];
  const rank3 = standings[2];

  const PodiumStand = ({ standing, rank }: { standing?: Standing; rank: 1 | 2 | 3 }) => {
    if (!standing || standing.points === 0) {
        return (
             <div className="flex flex-col items-center justify-end w-1/3 h-full opacity-30">
                <div className="w-16 h-16 rounded-full bg-gray-100 mb-4 border-2 border-dashed border-gray-300"></div>
                <div className={`w-full rounded-t-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 ${rank === 1 ? 'h-56' : rank === 2 ? 'h-40' : 'h-32'}`}></div>
             </div>
        );
    }

    const { team, points, sportsPoints, athleticsPoints } = standing;
    
    let heightClass = '';
    let bgClass = '';
    let borderClass = '';
    let shadowClass = '';
    let iconColor = '';
    let metallicGrad = '';
    
    if (rank === 1) {
        heightClass = 'h-56 md:h-72';
        bgClass = 'bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400';
        borderClass = 'border-yellow-100';
        shadowClass = 'shadow-[0_20px_60px_rgba(250,204,21,0.4)]';
        iconColor = 'text-yellow-700';
        metallicGrad = 'from-yellow-400 via-yellow-100 to-yellow-500';
    } else if (rank === 2) {
        heightClass = 'h-40 md:h-52';
        bgClass = 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400';
        borderClass = 'border-slate-100';
        shadowClass = 'shadow-[0_20px_50px_rgba(148,163,184,0.3)]';
        iconColor = 'text-slate-600';
        metallicGrad = 'from-slate-300 via-slate-50 to-slate-400';
    } else {
        heightClass = 'h-32 md:h-40';
        bgClass = 'bg-gradient-to-b from-orange-200 via-orange-300 to-orange-400';
        borderClass = 'border-orange-100';
        shadowClass = 'shadow-[0_20px_40px_rgba(251,146,60,0.3)]';
        iconColor = 'text-orange-700';
        metallicGrad = 'from-orange-400 via-orange-50 to-orange-500';
    }

    return (
      <div className={`flex flex-col items-center justify-end w-1/3 relative transition-all duration-1000 ${rank === 1 ? 'z-30 scale-110 -mb-4' : 'z-10'}`}>
        
        {rank === 1 && (
            <div className="animate-bounce mb-3 relative">
                <Crown size={48} className="text-yellow-500 fill-yellow-400 drop-shadow-lg" />
                <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
            </div>
        )}

        {/* Team Avatar */}
        <div className="relative mb-6 group cursor-default">
             <div className={`absolute -inset-6 rounded-full blur-3xl opacity-30 ${team.tailwindBg} group-hover:opacity-50 transition-opacity`}></div>
             <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white text-xs md:text-base font-black ${team.tailwindBg} transform transition-transform group-hover:scale-110 px-2 text-center leading-tight ring-[10px] ring-white/30`}>
                {team.name.split(' ')[0]}
             </div>
             <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-lg font-black shadow-xl bg-gradient-to-br ${metallicGrad} ${rank === 1 ? 'text-yellow-900' : 'text-gray-800'}`}>
                {rank}
             </div>
        </div>

        {/* Podium Block */}
        <div className={`w-full ${heightClass} ${bgClass} rounded-t-[3rem] ${shadowClass} border-t-4 ${borderClass} flex flex-col items-center justify-start pt-8 relative overflow-hidden group`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"></div>
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none"></div>
            
            <div className="relative z-20 flex flex-col items-center">
                <span className={`text-5xl md:text-7xl font-black ${iconColor} drop-shadow-md tracking-tighter`}>
                    {points}
                </span>
                <span className={`text-[10px] md:text-[12px] uppercase tracking-[0.3em] font-black ${iconColor} opacity-70 mt-1`}>
                    Total Points
                </span>

                {/* Breakdown Display */}
                <div className="mt-4 flex gap-4 bg-black/5 px-4 py-2 rounded-2xl border border-black/5">
                    <div className="flex items-center gap-1.5">
                        <Activity size={12} className={iconColor} />
                        <span className={`text-xs font-black ${iconColor}`}>{sportsPoints}</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-black/10 pl-4">
                        <Timer size={12} className={iconColor} />
                        <span className={`text-xs font-black ${iconColor}`}>{athleticsPoints}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto mb-8 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-100 shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,1)]"></div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative pt-16 pb-8 animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-blue-100/30 rounded-full blur-[120px] -z-10"></div>
        
        <div className="flex items-end justify-center gap-2 md:gap-8 px-2 max-w-4xl mx-auto min-h-[450px]">
            <PodiumStand standing={rank2} rank={2} />
            <PodiumStand standing={rank1} rank={1} />
            <PodiumStand standing={rank3} rank={3} />
        </div>
    </div>
  );
};

export default OverallPodium;
