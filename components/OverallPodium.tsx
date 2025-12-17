import React from 'react';
import { Team } from '../types';
import { Trophy, Medal, Star, Crown } from 'lucide-react';

interface Standing {
  team: Team;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface OverallPodiumProps {
  standings: Standing[];
}

const OverallPodium: React.FC<OverallPodiumProps> = ({ standings }) => {
  // Get Top 3
  const rank1 = standings[0];
  const rank2 = standings[1];
  const rank3 = standings[2];

  // Helper for rendering a single podium stand
  const PodiumStand = ({ standing, rank }: { standing?: Standing; rank: 1 | 2 | 3 }) => {
    if (!standing || standing.total === 0) {
        // Empty state placeholder
        return (
             <div className="flex flex-col items-center justify-end w-1/3 h-full opacity-50">
                <div className="w-16 h-16 rounded-full bg-gray-100 mb-2"></div>
                <div className={`w-full rounded-t-2xl bg-gray-100 ${rank === 1 ? 'h-48' : rank === 2 ? 'h-32' : 'h-24'}`}></div>
             </div>
        );
    }

    const { team, total } = standing;
    
    // Config based on rank
    let heightClass = '';
    let bgClass = '';
    let borderClass = '';
    let shadowClass = '';
    let iconColor = '';
    
    if (rank === 1) {
        heightClass = 'h-44 md:h-56';
        bgClass = 'bg-gradient-to-b from-yellow-200 to-yellow-300';
        borderClass = 'border-yellow-100';
        shadowClass = 'shadow-[0_10px_20px_rgba(250,204,21,0.3)]';
        iconColor = 'text-yellow-600';
    } else if (rank === 2) {
        heightClass = 'h-32 md:h-40';
        bgClass = 'bg-gradient-to-b from-slate-200 to-slate-300';
        borderClass = 'border-slate-100';
        shadowClass = 'shadow-[0_10px_20px_rgba(148,163,184,0.3)]';
        iconColor = 'text-slate-500';
    } else {
        heightClass = 'h-24 md:h-28';
        bgClass = 'bg-gradient-to-b from-orange-200 to-orange-300';
        borderClass = 'border-orange-100';
        shadowClass = 'shadow-[0_10px_20px_rgba(251,146,60,0.3)]';
        iconColor = 'text-orange-600';
    }

    return (
      <div className={`flex flex-col items-center justify-end w-1/3 relative z-10 ${rank === 1 ? '-mt-6 z-20' : ''}`}>
        
        {/* Crown for Winner */}
        {rank === 1 && (
            <div className="animate-bounce mb-1">
                <Crown size={32} className="text-yellow-500 fill-yellow-300 drop-shadow-sm" />
            </div>
        )}

        {/* Avatar */}
        <div className="relative mb-3 group">
             {/* เปลี่ยนจาก substring(0,1) เป็นชื่อสีเต็ม และลดขนาด font */}
             <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs md:text-sm font-black ${team.tailwindBg} transform transition-transform group-hover:scale-110 px-1 text-center leading-tight`}>
                {team.name.split(' ')[0]}
             </div>
             {/* Rank Badge */}
             <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold shadow-sm ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-orange-300 text-orange-800'}`}>
                {rank}
             </div>
        </div>

        {/* Team Name */}
        <div className="mb-2 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${team.tailwindBg}`}>
                {team.name.split(' ')[0]}
            </span>
        </div>

        {/* Podium Box */}
        <div className={`w-full ${heightClass} ${bgClass} rounded-t-3xl ${shadowClass} border-t-2 ${borderClass} flex flex-col items-center justify-start pt-4 relative overflow-hidden`}>
            {/* Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"></div>
            
            {/* Total Medals Count */}
            <div className="relative z-10 flex flex-col items-center">
                <span className={`text-4xl md:text-5xl font-black ${iconColor} drop-shadow-sm opacity-80`}>
                    {total}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${iconColor} opacity-60`}>
                    Medals
                </span>
            </div>

            {/* Medal Detail Icons (Tiny) */}
            <div className="mt-auto mb-4 flex gap-1 opacity-50">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative pt-8 pb-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-end justify-center gap-2 md:gap-6 px-2 max-w-2xl mx-auto">
            <PodiumStand standing={rank2} rank={2} />
            <PodiumStand standing={rank1} rank={1} />
            <PodiumStand standing={rank3} rank={3} />
        </div>
    </div>
  );
};

export default OverallPodium;