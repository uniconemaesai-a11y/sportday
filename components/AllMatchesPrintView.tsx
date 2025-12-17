import React from 'react';
import { SportTournament, Match } from '../types';
import { TEAMS } from '../constants';
import { Trophy } from 'lucide-react';

interface AllMatchesPrintViewProps {
  tournaments: Record<string, SportTournament>;
  sportsList: any[];
}

const AllMatchesPrintView: React.FC<AllMatchesPrintViewProps> = ({ tournaments, sportsList }) => {
  const roundNames: Record<string, string> = {
    'semi': 'รอบรองฯ',
    'third_place': 'ชิงที่ 3',
    'final': 'ชิงชนะเลิศ'
  };

  const calculateStandings = () => {
    const stats: Record<string, { team: typeof TEAMS[0], gold: number, silver: number, bronze: number, total: number }> = {};
    TEAMS.forEach(team => {
        stats[team.id] = { team, gold: 0, silver: 0, bronze: 0, total: 0 };
    });

    Object.values(tournaments).forEach((t: any) => {
        if (t.championId && stats[t.championId]) { stats[t.championId].gold++; stats[t.championId].total++; }
        if (t.runnerUpId && stats[t.runnerUpId]) { stats[t.runnerUpId].silver++; stats[t.runnerUpId].total++; }
        if (t.secondRunnerUpId && stats[t.secondRunnerUpId]) { stats[t.secondRunnerUpId].bronze++; stats[t.secondRunnerUpId].total++; }
    });

    return Object.values(stats).sort((a, b) => b.gold - a.gold || b.total - a.total);
  };

  const standings = calculateStandings();

  return (
    <div 
        id="master-print-container" 
        className="bg-white text-black p-12"
        style={{ display: 'none', width: '1123px' }}
    >
        <div className="flex flex-col items-center mb-10 border-b-4 border-black pb-8">
            <h1 className="text-5xl font-bold mb-4">รายงานสรุปผลกีฬาสีสัมพันธ์ ๒๕๖๘</h1>
            <h2 className="text-2xl text-gray-700">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h2>
        </div>

        <div className="w-full mb-12">
            <h3 className="text-3xl font-bold mb-6 text-center bg-gray-100 p-4 border-4 border-black rounded-2xl">ตารางสรุปเหรียญรางวัลรวม</h3>
            <table className="w-full border-4 border-black text-2xl">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border-4 border-black p-4 text-center">อันดับ</th>
                        <th className="border-4 border-black p-4 text-left">ทีมสี</th>
                        <th className="border-4 border-black p-4 text-center w-32 bg-yellow-100">ทอง</th>
                        <th className="border-4 border-black p-4 text-center w-32 bg-gray-100">เงิน</th>
                        <th className="border-4 border-black p-4 text-center w-32 bg-orange-100">ทองแดง</th>
                        <th className="border-4 border-black p-4 text-center w-32">รวม</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((row, idx) => (
                        <tr key={row.team.id}>
                            <td className="border-4 border-black p-4 text-center font-bold">{idx + 1}</td>
                            <td className="border-4 border-black p-4 font-bold">{row.team.name}</td>
                            <td className="border-4 border-black p-4 text-center font-bold">{row.gold}</td>
                            <td className="border-4 border-black p-4 text-center font-bold">{row.silver}</td>
                            <td className="border-4 border-black p-4 text-center font-bold">{row.bronze}</td>
                            <td className="border-4 border-black p-4 text-center font-bold">{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="w-full">
            <h3 className="text-3xl font-bold mb-8 border-b-4 border-dashed border-gray-300 pb-2">รายละเอียดผู้ชนะแต่ละประเภทกีฬา</h3>
            <div className="grid grid-cols-1 gap-10">
                {sportsList.map((sport) => {
                    const tournament = tournaments[sport.id];
                    if (!tournament || !tournament.championId) return null;

                    return (
                        <div key={sport.id} className="border-4 border-black rounded-3xl p-6 bg-white break-inside-avoid">
                            <div className="flex justify-between items-center mb-4 bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                                <h4 className="text-2xl font-bold">{sport.name} <span className="text-lg font-normal text-gray-500">({sport.category})</span></h4>
                                <div className="text-xl font-bold text-green-700">แชมป์: {TEAMS.find(t => t.id === tournament.championId)?.name}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-20 flex justify-around">
             <div className="text-center font-bold"><div className="mb-10">ลงชื่อ .......................................................</div><div>หัวหน้างานกิจกรรมนักเรียน</div></div>
             <div className="text-center font-bold"><div className="mb-10">ลงชื่อ .......................................................</div><div>ผู้อำนวยการโรงเรียน</div></div>
        </div>
    </div>
  );
};

export default AllMatchesPrintView;