import React, { useState } from 'react';
import { SportTournament, Match } from '../types';
import { TEAMS, toThaiNumber } from '../constants';
import MatchCard from './MatchCard';
import { Trophy, Medal, Download, Loader2, Printer, ChevronRight, FileText } from 'lucide-react';

interface BracketViewProps {
  tournament: SportTournament;
  onUpdateMatch: (match: Match) => void;
}

const BracketView: React.FC<BracketViewProps> = ({ tournament, onUpdateMatch }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  return (
    <div className="w-full max-w-6xl mx-auto" id="bracket-content">
      {/* Control Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
            <h2 className="text-4xl font-black text-blue-900 drop-shadow-sm leading-tight">{tournament.sportConfig.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{tournament.sportConfig.category}</span>
              <span className="text-gray-400 text-xs font-bold">Arena Board</span>
            </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={handlePrint}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-100 px-6 py-3 rounded-2xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 font-black"
            >
                <Printer size={20} className="text-blue-500" />
                <span>สั่งพิมพ์</span>
            </button>
            <button 
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 disabled:opacity-50 font-black"
            >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                <span>{isGenerating ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}</span>
            </button>
        </div>
      </div>

      {/* Interactive Web View */}
      <div className="no-print bg-white/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-2xl mb-12">
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
                    {[semi1, semi2, thirdPlace, final].map((m) => {
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