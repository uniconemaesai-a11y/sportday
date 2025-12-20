
import React from 'react';
import { SportTournament, Match } from '../types';
import { TEAMS, toThaiNumber, getIcon } from '../constants';

interface AllMatchesPrintViewProps {
  tournaments: Record<string, SportTournament>;
  sportsList: any[];
}

const AllMatchesPrintView: React.FC<AllMatchesPrintViewProps> = ({ tournaments, sportsList }) => {
  return (
    <div 
        id="master-print-container" 
        className="bg-white text-black p-0 font-serif"
        style={{ display: 'none' }}
    >
        {/* Cover Page / Header */}
        <div className="p-12 border-b-[10px] border-double border-black text-center mb-10">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_8s127m8s127m8s12.png" 
              alt="Logo" 
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h1 className="text-4xl font-black mb-2">ตารางสายการแข่งขันและบันทึกผลกีฬาสีสัมพันธ์ ๒๕๖๘</h1>
            <h2 className="text-xl font-bold italic text-gray-700">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h2>
        </div>

        {/* รายการชนิดกีฬาทั้งหมด */}
        <div className="px-12 space-y-12">
            {sportsList.map((sport, index) => {
                const tournament = tournaments[sport.id];
                if (!tournament) return null;

                const isAthletics = sport.type === 'athletics';
                
                return (
                    <div key={sport.id} className="break-inside-avoid border-4 border-black p-8 rounded-[2rem] bg-gray-50/20 relative overflow-hidden mb-8">
                        {/* Header ของแต่ละกีฬา */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                            <div>
                                <h3 className="text-3xl font-black">{toThaiNumber(index + 1)}. {sport.name}</h3>
                                <p className="text-lg font-bold text-gray-600">ประเภท/รุ่น: {sport.category}</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-black text-white px-4 py-1 rounded-lg text-sm font-black italic">
                                    {isAthletics ? 'RECORD SHEET' : 'BRACKET SHEET'}
                                </div>
                            </div>
                        </div>

                        {isAthletics ? (
                            /* Layout สำหรับ กรีฑา/กีฬาเด็กเล็ก */
                            <div className="grid grid-cols-1 gap-6">
                                <div className="border-2 border-black rounded-xl overflow-hidden">
                                    <table className="w-full text-center">
                                        <thead className="bg-gray-100 border-b-2 border-black">
                                            <tr>
                                                <th className="py-2 border-r-2 border-black w-1/4">อันดับที่</th>
                                                <th className="py-2 border-r-2 border-black w-1/2">คณะสี</th>
                                                <th className="py-2">สถิติ/หมายเหตุ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3].map(rank => (
                                                <tr key={rank} className="border-b border-black">
                                                    <td className="py-6 border-r-2 border-black font-black text-xl">ที่ {toThaiNumber(rank)}</td>
                                                    <td className="py-6 border-r-2 border-black font-bold text-lg italic">
                                                        ...........................................................
                                                    </td>
                                                    <td className="py-6 italic text-gray-400">........................</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* Layout สำหรับ กีฬาประเภททีม (สายแข่ง) */
                            <div className="grid grid-cols-2 gap-x-12 items-center">
                                {/* รอบรอง */}
                                <div className="space-y-6">
                                    {[1, 2].map(pair => {
                                        const match = tournament.matches.find(m => m.id.endsWith(`s${pair}`));
                                        return (
                                            <div key={pair} className="border-2 border-black p-3 rounded-xl bg-white">
                                                <p className="text-[10px] font-black border-b border-gray-100 mb-2">รอบรองชนะเลิศ คู่ที่ {toThaiNumber(pair)}</p>
                                                <div className="flex justify-between text-sm py-1">
                                                    <span>{TEAMS.find(t => t.id === match?.teamAId)?.name.split(' ')[0] || '................'}</span>
                                                    <span className="font-black"> [ {match?.status === 'finished' ? toThaiNumber(match.scoreA) : '  '} ]</span>
                                                </div>
                                                <div className="flex justify-between text-sm py-1 border-t border-gray-50">
                                                    <span>{TEAMS.find(t => t.id === match?.teamBId)?.name.split(' ')[0] || '................'}</span>
                                                    <span className="font-black"> [ {match?.status === 'finished' ? toThaiNumber(match.scoreB) : '  '} ]</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* รอบชิง */}
                                <div className="border-4 border-black p-4 rounded-2xl bg-yellow-50">
                                    <p className="text-[10px] font-black text-center mb-3">🏆 รอบชิงชนะเลิศ</p>
                                    <div className="flex justify-between items-center py-2 font-black text-lg">
                                        <span>...................................</span>
                                        <span>[   ]</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 font-black text-lg border-t-2 border-black/10">
                                        <span>...................................</span>
                                        <span>[   ]</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* พื้นที่ลงนามต่อกีฬา */}
                        <div className="mt-8 pt-4 border-t border-black/5 flex justify-between">
                            <p className="text-[10px] font-bold">ลงชื่อ .............................................. กรรมการ</p>
                            <p className="text-[10px] font-bold">ลงชื่อ .............................................. ผู้รับรอง</p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Master Footer */}
        <div className="p-12 text-center mt-10 border-t-4 border-black">
             <p className="font-black text-xl mb-4">รับรองความถูกต้องของตารางสายการแข่งขัน</p>
             <div className="flex justify-around mt-10">
                <div className="text-center">
                    <p className="mb-10">ลงชื่อ ............................................................</p>
                    <p className="font-bold">ประธานฝ่ายจัดการแข่งขัน</p>
                </div>
                <div className="text-center">
                    <p className="mb-10">ลงชื่อ ............................................................</p>
                    <p className="font-bold">ผู้อำนวยการโรงเรียน</p>
                </div>
             </div>
        </div>
    </div>
  );
};

export default AllMatchesPrintView;
