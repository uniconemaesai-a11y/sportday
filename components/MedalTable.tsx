import React from 'react';
import { Team } from '../types';
import { Trophy, Medal, Award, Sparkles, TrendingUp, Info } from 'lucide-react';

interface Standing {
  team: Team;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface MedalTableProps {
  standings: Standing[];
}

const MedalTable: React.FC<MedalTableProps> = ({ standings }) => {
  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl border-2 border-white overflow-hidden animate-fade-in ring-[16px] ring-white/20">
      
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-950 px-10 py-8 flex items-center justify-between relative overflow-hidden">
        {/* Dynamic Light Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]"></div>

        <div className="flex items-center gap-6 relative z-10">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
                <Trophy className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={36} fill="currentColor" />
            </div>
            <div>
                <h3 className="text-white font-black text-3xl md:text-4xl tracking-tight leading-none italic drop-shadow-md">สรุปเหรียญรางวัลรวม</h3>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
                      <TrendingUp size={14} className="text-cyan-400" />
                      <span className="text-cyan-100 text-[10px] font-black uppercase tracking-[0.2em]">Live Data ๒๕๖๘</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="relative z-10 hidden sm:flex items-center gap-4">
            <div className="text-right">
                <div className="text-white font-black text-sm uppercase tracking-widest opacity-80 italic">Official Records</div>
                <div className="text-blue-200 text-[10px] font-bold">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</div>
            </div>
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg">
                <Info size={20} />
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black border-b border-gray-100">
              <th className="px-8 py-8 text-center w-24 bg-gray-50/20">อันดับ</th>
              <th className="px-8 py-8 text-left bg-gray-50/20">ทีมสี / สังกัด</th>
              
              {/* Gold Header */}
              <th className="px-4 py-8 text-center w-28 bg-yellow-50/10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-yellow-400 flex items-center justify-center text-white shadow-xl shadow-yellow-100 border-2 border-white ring-4 ring-yellow-50">
                        <Medal size={22} fill="currentColor" />
                    </div>
                    <span>ทอง</span>
                </div>
              </th>

              {/* Silver Header */}
              <th className="px-4 py-8 text-center w-28 bg-slate-50/10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-300 flex items-center justify-center text-white shadow-xl shadow-slate-100 border-2 border-white ring-4 ring-slate-50">
                        <Medal size={22} fill="currentColor" />
                    </div>
                    <span>เงิน</span>
                </div>
              </th>

              {/* Bronze Header */}
              <th className="px-4 py-8 text-center w-28 bg-orange-50/10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-orange-400 flex items-center justify-center text-white shadow-xl shadow-orange-100 border-2 border-white ring-4 ring-orange-50">
                        <Medal size={22} fill="currentColor" />
                    </div>
                    <span>ทองแดง</span>
                </div>
              </th>

              {/* Prominent Total Header */}
              <th className="px-8 py-8 text-center w-40 bg-indigo-50/30 border-l-4 border-white">
                  <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-2 border-white ring-4 ring-indigo-50">
                          <Award size={22} />
                      </div>
                      <span className="text-indigo-600 font-black">รวมทั้งหมด</span>
                  </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((row, index) => (
              <tr key={row.team.id} className="hover:bg-blue-50/50 transition-all duration-500 group">
                {/* Rank */}
                <td className="px-8 py-8 text-center">
                    <div className={`mx-auto w-10 h-10 flex items-center justify-center rounded-2xl text-lg font-black shadow-lg transform group-hover:rotate-12 transition-transform ${
                        index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-yellow-300 text-white shadow-yellow-200' :
                        index === 1 ? 'bg-gradient-to-tr from-slate-300 to-slate-200 text-white shadow-slate-200' :
                        index === 2 ? 'bg-gradient-to-tr from-orange-400 to-orange-300 text-white shadow-orange-200' :
                        'text-gray-400 bg-white border-2 border-gray-50'
                    }`}>
                        {index + 1}
                    </div>
                </td>

                {/* Team Info */}
                <td className="px-8 py-8">
                  <div className="flex items-center gap-6">
                    {/* เปลี่ยนจาก substring(0,1) เป็นชื่อสีเต็ม และปรับขนาด font */}
                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white font-black text-xs shadow-2xl ${row.team.tailwindBg} ring-8 ring-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 px-1 text-center leading-tight`}>
                        {row.team.name.split(' ')[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-xl md:text-2xl group-hover:text-blue-600 transition-colors leading-none">{row.team.name.split(' ')[0]}</span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{row.team.name.split('(')[1]?.replace(')', '') || 'โรงเรียนเทศบาล ๑'}</span>
                        </div>
                    </div>
                  </div>
                </td>

                {/* Gold Count */}
                <td className="px-4 py-8 text-center bg-yellow-50/5">
                    <div className={`font-black text-3xl transition-transform group-hover:scale-125 ${row.gold > 0 ? 'text-yellow-600 drop-shadow-sm' : 'text-gray-100'}`}>
                        {row.gold || '-'}
                    </div>
                </td>

                {/* Silver Count */}
                <td className="px-4 py-8 text-center bg-slate-50/5">
                    <div className={`font-black text-3xl transition-transform group-hover:scale-125 ${row.silver > 0 ? 'text-slate-500 drop-shadow-sm' : 'text-gray-100'}`}>
                        {row.silver || '-'}
                    </div>
                </td>

                {/* Bronze Count */}
                <td className="px-4 py-8 text-center bg-orange-50/5">
                    <div className={`font-black text-3xl transition-transform group-hover:scale-125 ${row.bronze > 0 ? 'text-orange-600 drop-shadow-sm' : 'text-gray-100'}`}>
                        {row.bronze || '-'}
                    </div>
                </td>

                {/* Prominent Total Cell */}
                <td className="px-8 py-8 text-center bg-indigo-50/20 border-l-4 border-white relative group-hover:bg-indigo-100/30 transition-all">
                    <div className="relative inline-flex items-center justify-center">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-0 group-hover:opacity-30 rounded-full transition-opacity"></div>
                        
                        <div className="relative bg-gradient-to-br from-indigo-700 to-indigo-900 text-white font-black text-3xl w-20 h-20 flex items-center justify-center rounded-[2.5rem] shadow-2xl shadow-indigo-200 ring-4 ring-white border border-indigo-400 transform group-hover:scale-110 transition-transform">
                            {row.total}
                        </div>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Decoration */}
      <div className="p-8 bg-gray-50/50 border-t border-gray-100 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <p className="relative z-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] italic"> Municipal School 1 Athletic Medal Standings • 2025 Academic Year </p>
      </div>
    </div>
  );
};

export default MedalTable;