
import React, { useState, useMemo } from 'react';
import { SportTournament } from '../types';
import { TEAMS, getIcon } from '../constants';
import BroadcastCard from './BroadcastCard';
import { Search, Filter, LayoutGrid, List, Activity, Timer } from 'lucide-react';

interface SportWinnersGridProps {
  tournaments: Record<string, SportTournament>;
}

const SportWinnersGrid: React.FC<SportWinnersGridProps> = ({ tournaments }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sports' | 'athletics'>('all');

  const finishedList = useMemo(() => {
    return (Object.values(tournaments) as SportTournament[])
      .filter(t => t.championId)
      .filter(t => {
          const matchesSearch = t.sportConfig.name.toLowerCase().includes(search.toLowerCase()) || 
                               t.sportConfig.category.toLowerCase().includes(search.toLowerCase());
          const matchesType = filterType === 'all' || 
                             (filterType === 'sports' && t.sportConfig.type !== 'athletics') ||
                             (filterType === 'athletics' && t.sportConfig.type === 'athletics');
          return matchesSearch && matchesType;
      })
      .sort((a, b) => a.sportConfig.name.localeCompare(b.sportConfig.name));
  }, [tournaments, search, filterType]);

  return (
    <div className="space-y-10 animate-fade-in">
        <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic leading-none mb-4 uppercase">Match Summary</h2>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em]">Official Records of Winners ๒๕๖๘</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between no-print">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อกีฬาหรือรุ่น..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] font-black text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-50/50 transition-all shadow-sm"
                />
            </div>
            
            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[1.8rem] border border-gray-100">
                <button 
                    onClick={() => setFilterType('all')}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 ${filterType === 'all' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <LayoutGrid size={16} />
                    <span>ทั้งหมด</span>
                </button>
                <button 
                    onClick={() => setFilterType('sports')}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 ${filterType === 'sports' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Activity size={16} />
                    <span>กีฬาประเภททีม</span>
                </button>
                <button 
                    onClick={() => setFilterType('athletics')}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 ${filterType === 'athletics' ? 'bg-white text-amber-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Timer size={16} />
                    <span>กรีฑา</span>
                </button>
            </div>
        </div>

        {finishedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {finishedList.map((t, idx) => (
                    <BroadcastCard 
                        key={t.sportConfig.id}
                        sportName={t.sportConfig.name}
                        category={t.sportConfig.category}
                        championId={t.championId}
                        runnerUpId={t.runnerUpId}
                        secondRunnerUpId={t.secondRunnerUpId}
                        delay={idx * 50}
                    />
                ))}
            </div>
        ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <Filter size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-400 italic">ไม่พบผลการแข่งขันตามที่ค้นหา</h3>
                <p className="text-gray-300 mt-2 font-bold">ลองระบุชื่อกีฬาหรือเปลี่ยนประเภทตัวกรองดูนะ</p>
            </div>
        )}
    </div>
  );
};

export default SportWinnersGrid;
