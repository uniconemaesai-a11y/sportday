import React from 'react';
import { TEAMS } from '../constants';
import { Trophy, Medal, Flag } from 'lucide-react';

interface BroadcastCardProps {
  sportName: string;
  category: string;
  championId?: string;
  runnerUpId?: string;
  secondRunnerUpId?: string;
  delay?: number;
}

const BroadcastCard: React.FC<BroadcastCardProps> = ({ 
  sportName, 
  category, 
  championId, 
  runnerUpId, 
  secondRunnerUpId,
  delay = 0 
}) => {
  const champion = TEAMS.find(t => t.id === championId);
  const runnerUp = TEAMS.find(t => t.id === runnerUpId);
  const third = TEAMS.find(t => t.id === secondRunnerUpId);

  const WinnerRow = ({ rank, team }: { rank: 1 | 2 | 3, team?: typeof TEAMS[0] }) => {
    if (!team) return null;
    
    let bgColor = '';
    let icon = null;
    let label = '';
    
    if (rank === 1) {
        bgColor = 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white';
        icon = <Trophy size={16} className="text-yellow-100" />;
        label = 'GOLD';
    } else if (rank === 2) {
        bgColor = 'bg-white text-gray-800 border border-gray-100';
        icon = <Medal size={16} className="text-gray-400" />;
        label = 'SILVER';
    } else {
        bgColor = 'bg-white text-gray-800 border border-gray-100';
        icon = <Medal size={16} className="text-orange-400" />;
        label = 'BRONZE';
    }

    return (
        <div className={`flex items-center p-2 rounded-lg mb-2 shadow-sm relative overflow-hidden ${bgColor} ${rank === 1 ? 'shadow-lg transform scale-[1.02]' : ''}`}>
             {/* Rank Label for Gold */}
             {rank === 1 && (
                 <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/10 skew-x-12 transform translate-x-4"></div>
             )}

             <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center mr-3">
                 {rank === 1 ? (
                     <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">{icon}</div>
                 ) : (
                     <div className="bg-gray-50 p-2 rounded-full">{icon}</div>
                 )}
             </div>
             
             <div className="flex-grow">
                 <div className="flex items-center gap-2">
                     <span className={`text-xs font-bold uppercase tracking-widest ${rank === 1 ? 'text-yellow-100' : 'text-gray-400'}`}>
                         {label}
                     </span>
                 </div>
                 <div className={`font-bold text-lg leading-tight ${rank === 1 ? 'text-white' : 'text-gray-800'}`}>
                     {team.name}
                 </div>
             </div>
             
             {/* Team Color Strip */}
             <div className={`w-2 h-full absolute right-0 top-0 bottom-0 ${team.tailwindBg}`}></div>
        </div>
    );
  };

  return (
    <div 
        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow animate-slide-up"
        style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-blue-600 px-4 py-3 flex justify-between items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="relative z-10 text-white">
            <h4 className="font-bold text-lg leading-none">{sportName}</h4>
            <span className="text-blue-100 text-xs font-medium bg-blue-700/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                {category}
            </span>
        </div>
        <div className="relative z-10 bg-white/20 p-1.5 rounded-lg">
            <Flag size={20} className="text-white" />
        </div>
      </div>
      
      <div className="p-4 bg-gray-50/50">
        {champion ? (
            <>
                <WinnerRow rank={1} team={champion} />
                <WinnerRow rank={2} team={runnerUp} />
                <WinnerRow rank={3} team={third} />
            </>
        ) : (
            <div className="text-center py-8 text-gray-400 text-sm italic">
                ยังไม่ทราบผลการแข่งขัน
            </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastCard;
