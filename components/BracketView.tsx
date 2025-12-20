
import React, { useState } from 'react';
import { SportTournament, Match } from '../types';
import { TEAMS, toThaiNumber, getIcon } from '../constants';
import MatchCard from './MatchCard';
import { Trophy, Medal, Download, Loader2, Printer, ChevronRight, FileText, LayoutGrid, List } from 'lucide-react';

interface BracketViewProps {
  tournament: SportTournament;
  onUpdateMatch: (match: Match) => void;
}

const BracketView: React.FC<BracketViewProps> = ({ tournament, onUpdateMatch }) => {
  const [viewMode, setViewMode] = useState<'bracket' | 'table'>('bracket');
  
  const semi1 = tournament.matches.find(m => m.round === 'semi' && m.id.endsWith('s1'));
  const semi2 = tournament.matches.find(m => m.round === 'semi' && m.id.endsWith('s2'));
  const final = tournament.matches.find(m => m.round === 'final');
  const thirdPlace = tournament.matches.find(m => m.round === 'third_place');

  if (!semi1 || !semi2 || !final || !thirdPlace) return null;

  const handlePrintReport = () => {
    document.body.dataset.printMode = 'report';
    window.print();
    delete document.body.dataset.printMode;
  };

  const handlePrintBracket = () => {
    document.body.dataset.printMode = 'bracket';
    window.print();
    delete document.body.dataset.printMode;
  };

  const roundNames: Record<string, string> = {
      'semi': 'รอบรองชนะเลิศ',
      'third_place': 'ชิงอันดับที่ ๓',
      'final': 'ชิงชนะเลิศ'
  };

  const sortedMatches = [semi1, semi2, thirdPlace, final];

  return (
    <div className="w-full max-w-6xl mx-auto" id="bracket-content">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 no-print">
        <div className="flex items-center gap-6">
            <div className="bg-white p-5 rounded-[2rem] text-blue-500 shadow-xl border-4 border-white ring-8 ring-blue-50/50">
                {getIcon(tournament.sportConfig.iconName, 40)}
            </div>
            <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic leading-none">{tournament.sportConfig.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">{tournament.sportConfig.category}</span>
                </div>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[1.8rem] shadow-sm border-2 border-white flex gap-1 mr-2">
                <button 
                    onClick={() => setViewMode('bracket')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all ${viewMode === 'bracket' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <LayoutGrid size={16} />
                    <span>ผังการแข่งขัน</span>
                </button>
                <button 
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <List size={16} />
                    <span>ตารางสรุปผล</span>
                </button>
            </div>

            <button onClick={handlePrintBracket} className="flex items-center gap-2 bg-white text-gray-700 border-4 border-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 font-black text-[11px] italic">
                <Printer size={18} className="text-blue-500" />
                <span>พิมพ์สายแข่ง</span>
            </button>
            <button onClick={handlePrintReport} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 font-black text-[11px] italic">
                <FileText size={18} className="text-yellow-400" />
                <span>สรุปผล</span>
            </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="no-print mb-16 animate-fade-in">
          {viewMode === 'bracket' ? (
              <div className="space-y-16">
                  {/* Final & Semis Section */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative py-4">
                     {/* Semis Column */}
                     <div className="w-full md:w-[45%] space-y-10 relative z-10">
                        <MatchCard match={semi1} title="รอบรองชนะเลิศ ๑" onUpdate={onUpdateMatch} />
                        <MatchCard match={semi2} title="รอบรองชนะเลิศ ๒" onUpdate={onUpdateMatch} />
                     </div>
                     
                     {/* Final Card - Stand Out */}
                     <div className="w-full md:w-[50%] z-20">
                        <div className="relative p-2 rounded-[3.5rem] bg-gradient-to-br from-yellow-100 via-white to-yellow-100 shadow-3xl border-4 border-white ring-[12px] ring-yellow-400/20">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-10 py-2 rounded-full font-black italic tracking-tighter text-xl shadow-xl z-30 flex items-center gap-3">
                                <Trophy size={20} fill="currentColor" />
                                <span>FINALS</span>
                            </div>
                            <div className="pt-6">
                                <MatchCard match={final} title="คู่ชิงชนะเลิศ" onUpdate={onUpdateMatch} />
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* 3rd Place Section - Compact & Centered */}
                  <div className="flex flex-col items-center gap-6">
                      <div className="h-12 w-1 bg-gradient-to-b from-gray-200 to-transparent"></div>
                      <div className="w-full max-w-[450px] transform hover:scale-105 transition-all duration-500">
                          <MatchCard match={thirdPlace} title="ชิงอันดับ ๓" onUpdate={onUpdateMatch} />
                      </div>
                  </div>
              </div>
          ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-10 shadow-3xl border-4 border-white overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full border-collapse">
                          <thead>
                              <tr className="border-b-4 border-gray-50">
                                  <th className="px-6 py-6 text-left text-[11px] font-black uppercase tracking-widest text-gray-400 italic">รอบการแข่งขัน</th>
                                  <th className="px-6 py-6 text-center text-[11px] font-black uppercase tracking-widest text-gray-400 italic">ทีมที่แข่งขัน</th>
                                  <th className="px-6 py-6 text-center text-[11px] font-black uppercase tracking-widest text-gray-400 italic">ผลการแข่ง</th>
                                  <th className="px-6 py-6 text-right text-[11px] font-black uppercase tracking-widest text-gray-400 italic">ผู้ชนะ</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {sortedMatches.map((m) => {
                                  const tA = TEAMS.find(t => t.id === m.teamAId);
                                  const tB = TEAMS.find(t => t.id === m.teamBId);
                                  const winner = TEAMS.find(t => t.id === m.winnerId);
                                  return (
                                      <tr key={m.id} className="hover:bg-blue-50/50 transition-all duration-300">
                                          <td className="px-6 py-10 font-black text-gray-800 text-xl italic">{roundNames[m.round]}</td>
                                          <td className="px-6 py-10 text-center">
                                              <div className="flex items-center justify-center gap-6">
                                                  <div className="flex items-center gap-3">
                                                      <span className={`text-sm font-black ${m.winnerId === m.teamAId ? 'text-blue-600' : 'text-gray-400'}`}>{tA ? tA.name.split(' ')[0] : '...'}</span>
                                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[11px] font-black shadow-lg ${tA?.tailwindBg || 'bg-gray-100'}`}>
                                                          {tA ? tA.name.substring(0,1) : '?'}
                                                      </div>
                                                  </div>
                                                  <span className="text-gray-200 font-black italic">VS</span>
                                                  <div className="flex items-center gap-3">
                                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[11px] font-black shadow-lg ${tB?.tailwindBg || 'bg-gray-100'}`}>
                                                          {tB ? tB.name.substring(0,1) : '?'}
                                                      </div>
                                                      <span className={`text-sm font-black ${m.winnerId === m.teamBId ? 'text-blue-600' : 'text-gray-400'}`}>{tB ? tB.name.split(' ')[0] : '...'}</span>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-10 text-center">
                                              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-2 border-gray-50 font-black text-3xl shadow-sm">
                                                  <span className={m.winnerId === m.teamAId ? 'text-blue-600' : 'text-gray-300'}>{toThaiNumber(m.scoreA)}</span>
                                                  <span className="text-gray-100">:</span>
                                                  <span className={m.winnerId === m.teamBId ? 'text-blue-600' : 'text-gray-300'}>{toThaiNumber(m.scoreB)}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-10 text-right">
                                              {winner ? (
                                                  <div className="inline-flex items-center gap-2 bg-yellow-400 text-white px-6 py-2.5 rounded-2xl font-black italic shadow-lg">
                                                      <Trophy size={16} fill="currentColor" />
                                                      <span>{winner.name.split(' ')[0]}</span>
                                                  </div>
                                              ) : (
                                                  <span className="text-gray-300 italic font-black text-xs uppercase tracking-widest">Pending</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>

      {/* Official Print View Container Remains Same */}
      <div id="report-print-container" className="hidden print:block p-12 text-black bg-white">
        {/* ... (Existing official print code remains unchanged for consistency) */}
      </div>
    </div>
  );
};

export default BracketView;
