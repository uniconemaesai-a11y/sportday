
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
    >
        {/* หัวเอกสารหลัก */}
        <div className="p-12 border-b-[10px] border-double border-black text-center mb-10">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_8s127m8s127m8s12.png" 
              alt="Logo" 
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h1 className="text-4xl font-black mb-2 leading-tight">ตารางการแข่งขันและใบบันทึกผลรวมทุกชนิดกีฬา</h1>
            <h2 className="text-xl font-bold italic text-gray-700">กีฬาสีสัมพันธ์ โรงเรียนเทศบาล ๑ วัดพรหมวิหาร ๒๕๖๘</h2>
        </div>

        {/* รายการชนิดกีฬาทั้งหมด วนลูปแสดงผล */}
        <div className="px-12 space-y-10">
            {sportsList.map((sport, index) => {
                const tournament = tournaments[sport.id];
                if (!tournament) return null;

                const isAthletics = sport.type === 'athletics';
                
                return (
                    <div key={sport.id} className="break-inside-avoid border-2 border-black p-8 rounded-[1.5rem] bg-white relative mb-8">
                        {/* Header ของแต่ละกีฬา */}
                        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
                            <div>
                                <h3 className="text-2xl font-black">{toThaiNumber(index + 1)}. {sport.name}</h3>
                                <p className="text-lg font-bold text-gray-600">รุ่น/ประเภท: {sport.category}</p>
                            </div>
                            <div className="text-right">
                                <div className="border-2 border-black px-4 py-1 rounded-lg text-sm font-black uppercase">
                                    {isAthletics ? 'RECORD SHEET' : 'BRACKET SHEET'}
                                </div>
                            </div>
                        </div>

                        {isAthletics ? (
                            /* Layout สำหรับ กรีฑา/กีฬาเด็กเล็ก - ตารางบันทึกอันดับ */
                            <div className="w-full">
                                <table className="w-full text-center border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 border-2 border-black w-1/4 font-black">อันดับที่</th>
                                            <th className="py-3 border-2 border-black w-1/2 font-black">คณะสี (ระบุชื่อสี)</th>
                                            <th className="py-3 border-2 border-black font-black">หมายเหตุ/สถิติ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1, 2, 3].map(rank => (
                                            <tr key={rank}>
                                                <td className="py-8 border-2 border-black font-black text-xl italic">
                                                    อันดับที่ {toThaiNumber(rank)}
                                                </td>
                                                <td className="py-8 border-2 border-black">
                                                    <div className="w-3/4 mx-auto border-b border-dotted border-black pt-4"></div>
                                                </td>
                                                <td className="py-8 border-2 border-black">
                                                    <div className="w-1/2 mx-auto border-b border-dotted border-black pt-4"></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Layout สำหรับ กีฬาประเภททีม - ผังสายแข่ง */
                            <div className="grid grid-cols-2 gap-x-12 items-center py-4">
                                {/* รอบรองชนะเลิศ */}
                                <div className="space-y-6">
                                    {[1, 2].map(pair => {
                                        const match = tournament.matches.find(m => m.id.endsWith(`s${pair}`));
                                        return (
                                            <div key={pair} className="border-2 border-black p-4 rounded-xl relative">
                                                <p className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black border border-black rounded">
                                                    รอบรองชนะเลิศ คู่ที่ {toThaiNumber(pair)}
                                                </p>
                                                <div className="flex justify-between items-center py-2 font-bold">
                                                    <span>{TEAMS.find(t => t.id === match?.teamAId)?.name.split(' ')[0] || '................'}</span>
                                                    <div className="border border-black w-10 h-8 flex items-center justify-center font-black">
                                                        {match?.status === 'finished' ? toThaiNumber(match.scoreA) : ''}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center py-2 font-bold border-t border-gray-200">
                                                    <span>{TEAMS.find(t => t.id === match?.teamBId)?.name.split(' ')[0] || '................'}</span>
                                                    <div className="border border-black w-10 h-8 flex items-center justify-center font-black">
                                                        {match?.status === 'finished' ? toThaiNumber(match.scoreB) : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* รอบชิงชนะเลิศ */}
                                <div className="border-4 border-black p-6 rounded-2xl bg-gray-50/50">
                                    <h4 className="text-center font-black mb-4 underline">รอบชิงชนะเลิศ (FINALS)</h4>
                                    <div className="flex justify-between items-center py-4 font-black text-xl">
                                        <div className="border-b-2 border-black flex-grow mr-4 italic text-gray-400">..............................</div>
                                        <div className="border-4 border-black w-14 h-12 flex items-center justify-center"></div>
                                    </div>
                                    <div className="flex justify-between items-center py-4 font-black text-xl">
                                        <div className="border-b-2 border-black flex-grow mr-4 italic text-gray-400">..............................</div>
                                        <div className="border-4 border-black w-14 h-12 flex items-center justify-center"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* พื้นที่ลงนามต่อรายการ */}
                        <div className="mt-8 pt-4 border-t-2 border-black flex justify-between px-4 italic">
                            <p className="text-xs font-bold">ลงชื่อ ................................................. กรรมการผู้ตัดสิน</p>
                            <p className="text-xs font-bold">ลงชื่อ ................................................. ผู้บันทึก/รับรอง</p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* ส่วนท้ายใบงานสรุป */}
        <div className="p-12 text-center mt-10 border-t-8 border-double border-black">
             <p className="font-black text-2xl mb-12">ตรวจสอบและรับรองตารางสายการแข่งขันทั้งหมด</p>
             <div className="grid grid-cols-2 gap-20">
                <div className="text-center">
                    <p className="mb-16 italic text-gray-400">ลงชื่อ ............................................................</p>
                    <p className="font-black">ประธานฝ่ายจัดการแข่งขัน</p>
                    <p className="text-sm mt-1">( ............................................................ )</p>
                </div>
                <div className="text-center">
                    <p className="mb-16 italic text-gray-400">ลงชื่อ ............................................................</p>
                    <p className="font-black">ผู้อำนวยการโรงเรียนเทศบาล ๑ วัดพรหมวิหาร</p>
                    <p className="text-sm mt-1">( ............................................................ )</p>
                </div>
             </div>
             <div className="mt-20 text-[10px] font-bold opacity-30 italic">
                เอกสารประกอบการจัดการแข่งขันกีฬาสีสัมพันธ์ ประจำปีการศึกษา ๒๕๖๘
             </div>
        </div>
    </div>
  );
};

export default AllMatchesPrintView;
