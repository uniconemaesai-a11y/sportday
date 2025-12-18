import React from 'react';
import { SportTournament, Match } from '../types';
import { TEAMS, toThaiNumber, getIcon } from '../constants';

interface AllMatchesPrintViewProps {
  tournaments: Record<string, SportTournament>;
  sportsList: any[];
}

const AllMatchesPrintView: React.FC<AllMatchesPrintViewProps> = ({ tournaments, sportsList }) => {
  const roundNames: Record<string, string> = {
    'semi': 'รอบรองชนะเลิศ',
    'third_place': 'ชิงอันดับที่ ๓',
    'final': 'ชิงชนะเลิศ'
  };

  return (
    <div 
        id="master-print-container" 
        className="bg-white text-black p-0 font-serif"
        style={{ display: 'none', width: '1123px' }}
    >
        {/* Cover Page / Header */}
        <div className="p-12 border-b-[10px] border-double border-black text-center mb-10">
            <h1 className="text-5xl font-black mb-4">ตารางสายการแข่งขันกีฬาสีสัมพันธ์ ๒๕๖๘</h1>
            <h2 className="text-2xl font-bold">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h2>
            <p className="text-xl mt-4 italic">เอกสารบันทึกคะแนนและผังการแข่งขันอย่างเป็นทางการ (Official Bracket Book)</p>
        </div>

        {/* Tournament Brackets Section */}
        <div className="px-12 space-y-16">
            {sportsList.map((sport, index) => {
                const tournament = tournaments[sport.id];
                if (!tournament) return null;

                const s1 = tournament.matches.find(m => m.id.endsWith('s1'));
                const s2 = tournament.matches.find(m => m.id.endsWith('s2'));
                const t3 = tournament.matches.find(m => m.round === 'third_place');
                const fin = tournament.matches.find(m => m.round === 'final');

                const getTeamName = (id?: string) => {
                    const t = TEAMS.find(team => team.id === id);
                    return t ? t.name : '..........................';
                };

                return (
                    <div key={sport.id} className="break-inside-avoid border-4 border-black p-10 rounded-[3rem] bg-gray-50/30 relative overflow-hidden">
                        {/* Watermark Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[4]">
                            {getIcon(sport.iconName, 120)}
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
                                <div>
                                    <h3 className="text-4xl font-black">{toThaiNumber(index + 1)}. {sport.name}</h3>
                                    <p className="text-xl font-bold text-gray-600">ประเภท: {sport.category}</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-black text-white px-6 py-2 rounded-xl text-lg font-black italic">
                                        MATCH RECORD
                                    </div>
                                </div>
                            </div>

                            {/* Visual Bracket Display */}
                            <div className="grid grid-cols-2 gap-x-20 gap-y-12 items-center relative">
                                {/* Semi Finals Column */}
                                <div className="space-y-12">
                                    <div className="border-2 border-black p-4 rounded-2xl bg-white shadow-sm">
                                        <p className="text-xs font-black mb-2 border-b border-gray-100 pb-1">รอบรองชนะเลิศ คู่ที่ ๑</p>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="font-bold">{getTeamName(s1?.teamAId)}</span>
                                            <span className="text-2xl font-black">[{s1?.status === 'finished' ? toThaiNumber(s1.scoreA) : '  '}]</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                                            <span className="font-bold">{getTeamName(s1?.teamBId)}</span>
                                            <span className="text-2xl font-black">[{s1?.status === 'finished' ? toThaiNumber(s1.scoreB) : '  '}]</span>
                                        </div>
                                    </div>

                                    <div className="border-2 border-black p-4 rounded-2xl bg-white shadow-sm">
                                        <p className="text-xs font-black mb-2 border-b border-gray-100 pb-1">รอบรองชนะเลิศ คู่ที่ ๒</p>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="font-bold">{getTeamName(s2?.teamAId)}</span>
                                            <span className="text-2xl font-black">[{s2?.status === 'finished' ? toThaiNumber(s2.scoreA) : '  '}]</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                                            <span className="font-bold">{getTeamName(s2?.teamBId)}</span>
                                            <span className="text-2xl font-black">[{s2?.status === 'finished' ? toThaiNumber(s2.scoreB) : '  '}]</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Finals Column */}
                                <div className="space-y-12">
                                    <div className="border-4 border-black p-6 rounded-[2rem] bg-yellow-50 relative">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-[10px] font-black italic">CHAMPIONSHIP MATCH</div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-xl font-black">{getTeamName(fin?.teamAId)}</span>
                                            <span className="text-3xl font-black">[{fin?.status === 'finished' ? toThaiNumber(fin.scoreA) : '  '}]</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t-2 border-black/10">
                                            <span className="text-xl font-black">{getTeamName(fin?.teamBId)}</span>
                                            <span className="text-3xl font-black">[{fin?.status === 'finished' ? toThaiNumber(fin.scoreB) : '  '}]</span>
                                        </div>
                                    </div>

                                    <div className="border-2 border-black p-4 rounded-2xl bg-white/50 border-dashed">
                                        <p className="text-xs font-black mb-2">รอบชิงอันดับที่ ๓</p>
                                        <div className="flex justify-between items-center opacity-70">
                                            <span className="font-bold">{getTeamName(t3?.teamAId)}</span>
                                            <span className="text-lg font-black">[{t3?.status === 'finished' ? toThaiNumber(t3.scoreA) : '  '}]</span>
                                        </div>
                                        <div className="flex justify-between items-center opacity-70 border-t border-gray-100">
                                            <span className="font-bold">{getTeamName(t3?.teamBId)}</span>
                                            <span className="text-lg font-black">[{t3?.status === 'finished' ? toThaiNumber(t3.scoreB) : '  '}]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Official Signature Area for each sport */}
                            <div className="mt-10 pt-6 border-t border-black/10 grid grid-cols-2 gap-10">
                                <div className="text-center">
                                    <p className="text-xs font-bold mb-8">ลงชื่อ ................................................. กรรมการผู้ตัดสิน</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Referee Signature</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold mb-8">ลงชื่อ ................................................. ผู้บันทึกผล</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Record Keeper</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Master Footer Page */}
        <div className="page-break"></div>
        <div className="p-12 text-center mt-20">
             <div className="border-4 border-black p-12 rounded-[4rem] inline-block mb-10">
                <h3 className="text-3xl font-black mb-8">การรับรองผลการแข่งขันระดับโรงเรียน</h3>
                <div className="space-y-12">
                    <div className="text-center">
                        <p className="mb-12">ลงชื่อ ..........................................................................................</p>
                        <p className="font-bold">( .......................................................................................... )</p>
                        <p className="text-lg font-black mt-2">ประธานกรรมการฝ่ายกีฬา</p>
                    </div>
                    <div className="text-center">
                        <p className="mb-12">ลงชื่อ ..........................................................................................</p>
                        <p className="font-bold">( .......................................................................................... )</p>
                        <p className="text-lg font-black mt-2">ผู้อำนวยการโรงเรียนเทศบาล ๑ วัดพรหมวิหาร</p>
                    </div>
                </div>
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-[0.5em] text-xs">Academic Sports Record • 2568</p>
        </div>
    </div>
  );
};

export default AllMatchesPrintView;
