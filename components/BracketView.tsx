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
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'bracket' | 'table'>('bracket');
  
  const semi1 = tournament.matches.find(m => m.round === 'semi' && m.id.endsWith('s1'));
  const semi2 = tournament.matches.find(m => m.round === 'semi' && m.id.endsWith('s2'));
  const final = tournament.matches.find(m => m.round === 'final');
  const thirdPlace = tournament.matches.find(m => m.round === 'third_place');

  if (!semi1 || !semi2 || !final || !thirdPlace) return null;

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    const printElement = document.getElementById('pdf-print-container');
    
    if (printElement && (window as any).html2pdf) {
        const originalStyle = printElement.getAttribute('style') || '';
        printElement.style.display = 'block';
        printElement.style.position = 'fixed';
        printElement.style.top = '0';
        printElement.style.left = '0';
        printElement.style.zIndex = '9999';
        printElement.style.backgroundColor = 'white';
        printElement.style.width = '1123px';

        const opt = {
            margin: 10,
            filename: `ตารางแข่ง_${tournament.sportConfig.name}_${tournament.sportConfig.category}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        setTimeout(() => {
            (window as any).html2pdf().set(opt).from(printElement).save().then(() => {
                printElement.setAttribute('style', originalStyle);
                setIsGenerating(false);
            }).catch((err: any) => {
                console.error(err);
                printElement.setAttribute('style', originalStyle);
                setIsGenerating(false);
                alert("เกิดข้อผิดพลาดในการสร้าง PDF");
            });
        }, 1200);
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 no-print">
        <div className="flex items-center gap-5">
            <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-100">
                {getIcon(tournament.sportConfig.iconName, 32)}
            </div>
            <div>
                <h2 className="text-4xl font-black text-blue-900 drop-shadow-sm leading-tight italic">{tournament.sportConfig.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{tournament.sportConfig.category}</span>
                </div>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* View Switcher */}
            <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-100 flex gap-1 mr-2">
                <button 
                    onClick={() => setViewMode('bracket')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${viewMode === 'bracket' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <LayoutGrid size={16} />
                    <span>ผังการแข่งขัน</span>
                </button>
                <button 
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <List size={16} />
                    <span>ตารางสรุปผล</span>
                </button>
            </div>

            <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-100 px-6 py-2.5 rounded-2xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 font-black text-[11px]"
            >
                <Printer size={18} className="text-blue-500" />
                <span>สั่งพิมพ์</span>
            </button>
            <button 
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-gray-900 to-indigo-900 text-white px-8 py-2.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 font-black text-[11px]"
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>{isGenerating ? 'กำลังสร้าง...' : 'PDF รายงาน'}</span>
            </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="no-print mb-12 animate-fade-in">
          {viewMode === 'bracket' ? (
              /* Interactive Bracket View */
              <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 min-h-[500px] relative">
                     <div className="w-full md:w-[45%] space-y-12 relative z-10">
                        <MatchCard match={semi1} title="รอบรองชนะเลิศ ๑" onUpdate={onUpdateMatch} />
                        <MatchCard match={semi2} title="รอบรองชนะเลิศ ๒" onUpdate={onUpdateMatch} />
                     </div>
                     
                     <div className="w-full md:w-[48%] z-10">
                        <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-2 rounded-[3rem] shadow-2xl border-2 border-yellow-200 ring-8 ring-yellow-100/30">
                            <div className="text-center mb-4 pt-4">
                              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-yellow-200 mb-2">
                                <Trophy size={32} fill="currentColor" />
                              </div>
                              <div className="font-black text-yellow-600 uppercase tracking-tighter text-2xl italic">Champion Match</div>
                            </div>
                            <MatchCard match={final} title="คู่ชิงชนะเลิศ" onUpdate={onUpdateMatch} />
                        </div>
                     </div>
                  </div>

                  <div className="mt-16 flex justify-center">
                     <div className="w-full max-w-sm opacity-90 scale-95 hover:scale-100 transition-all">
                        <MatchCard match={thirdPlace} title="ชิงอันดับ ๓" onUpdate={onUpdateMatch} />
                     </div>
                  </div>
              </div>
          ) : (
              /* Summary Table Web View */
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-white overflow-hidden">
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
                                      <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                                          <td className="px-6 py-8 font-black text-gray-700 text-lg italic">{roundNames[m.round]}</td>
                                          <td className="px-6 py-8">
                                              <div className="flex items-center justify-center gap-4">
                                                  <div className="flex items-center gap-3">
                                                      <span className={`text-sm font-black ${m.winnerId === m.teamAId ? 'text-blue-600' : 'text-gray-400'}`}>{tA ? tA.name.split(' ')[0] : '...'}</span>
                                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm ${tA?.tailwindBg || 'bg-gray-100'}`}>
                                                          {tA ? tA.name.substring(0,1) : '?'}
                                                      </div>
                                                  </div>
                                                  <span className="text-gray-200 font-black italic">VS</span>
                                                  <div className="flex items-center gap-3">
                                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm ${tB?.tailwindBg || 'bg-gray-100'}`}>
                                                          {tB ? tB.name.substring(0,1) : '?'}
                                                      </div>
                                                      <span className={`text-sm font-black ${m.winnerId === m.teamBId ? 'text-blue-600' : 'text-gray-400'}`}>{tB ? tB.name.split(' ')[0] : '...'}</span>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-8 text-center">
                                              <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 font-black text-2xl">
                                                  <span className={m.winnerId === m.teamAId ? 'text-blue-600' : 'text-gray-300'}>{toThaiNumber(m.scoreA)}</span>
                                                  <span className="text-gray-200">:</span>
                                                  <span className={m.winnerId === m.teamBId ? 'text-blue-600' : 'text-gray-300'}>{toThaiNumber(m.scoreB)}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-8 text-right">
                                              {winner ? (
                                                  <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-2xl border border-yellow-100 font-black italic">
                                                      <Trophy size={14} fill="currentColor" />
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

      {/* OFFICIAL PRINT TEMPLATE (Hidden in Web, visible in Print/PDF) */}
      <div id="pdf-print-container" className="print-only-element p-12 text-black bg-white" style={{ display: 'none' }}>
            <div className="text-center mb-10 border-b-8 border-double border-black pb-8">
                <h1 className="text-5xl font-black mb-2">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h1>
                <h2 className="text-2xl text-gray-700 italic font-bold">สรุปผลการแข่งขันกีฬาสีสัมพันธ์ ประจำปีการศึกษา ๒๕๖๘</h2>
            </div>
            
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="bg-black text-white px-8 py-3 rounded-2xl text-3xl font-black uppercase italic">
                    {tournament.sportConfig.name}
                </div>
                <div className="text-2xl font-black text-gray-500 tracking-widest border-b-4 border-gray-200">
                    รุ่น: {tournament.sportConfig.category}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-12">
                <div className="border-4 border-black p-6 rounded-3xl flex items-center justify-between bg-gray-50">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Winner / Champion</span>
                        <span className="text-5xl font-black text-blue-900 mt-2">
                            {tournament.championId ? TEAMS.find(t => t.id === tournament.championId)?.name : '...................................................'}
                        </span>
                    </div>
                    <Trophy size={80} className="text-yellow-500 opacity-20" />
                </div>
            </div>

            <table className="w-full border-collapse border-4 border-black text-2xl mb-12">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border-4 border-black p-5 text-center font-black">รอบการแข่งขัน</th>
                        <th className="border-4 border-black p-5 text-center font-black">คู่แข่งขัน</th>
                        <th className="border-4 border-black p-5 text-center font-black w-40">คะแนน</th>
                        <th className="border-4 border-black p-5 text-center font-black">ผู้ชนะ</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedMatches.map((m) => {
                         const tA = TEAMS.find(t => t.id === m.teamAId);
                         const tB = TEAMS.find(t => t.id === m.teamBId);
                         const winner = TEAMS.find(t => t.id === m.winnerId);
                         return (
                             <tr key={m.id} className={m.round === 'final' ? 'bg-yellow-50' : ''}>
                                 <td className="border-4 border-black p-6 text-center font-bold">{roundNames[m.round]}</td>
                                 <td className="border-4 border-black p-6 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="font-bold">{tA ? tA.name : '...'}</span>
                                        <span className="text-gray-300 font-bold italic">VS</span>
                                        <span className="font-bold">{tB ? tB.name : '...'}</span>
                                    </div>
                                 </td>
                                 <td className="border-4 border-black p-6 text-center font-black text-4xl bg-white">
                                    {m.status === 'finished' ? `${toThaiNumber(m.scoreA)} : ${toThaiNumber(m.scoreB)}` : '-'}
                                 </td>
                                 <td className="border-4 border-black p-6 text-center font-bold text-blue-800">
                                    {winner ? winner.name : '-'}
                                 </td>
                             </tr>
                         );
                    })}
                </tbody>
            </table>

            <div className="grid grid-cols-2 gap-12 mt-24">
                <div className="text-center pt-12">
                    <div className="mb-12 font-bold text-xl">ลงชื่อ .......................................................</div>
                    <div className="font-black text-lg">กรรมการผู้ตัดสิน</div>
                    <div className="text-sm text-gray-400 mt-2">( .................................................................... )</div>
                </div>
                <div className="text-center pt-12">
                    <div className="mb-12 font-bold text-xl">ลงชื่อ .......................................................</div>
                    <div className="font-black text-lg">ครูผู้บันทึกผล / ผู้จัดการสนาม</div>
                    <div className="text-sm text-gray-400 mt-2">( .................................................................... )</div>
                </div>
            </div>
            
            <div className="mt-20 text-center border-t-2 border-gray-100 pt-6">
                <div className="text-xs text-gray-300 font-black tracking-[0.5em] uppercase">Academic Record Systems • Municipal School 1 Wat Phrom Vihan</div>
            </div>
      </div>
    </div>
  );
};

export default BracketView;
