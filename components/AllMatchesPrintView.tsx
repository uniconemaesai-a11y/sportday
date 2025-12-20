
import React from 'react';
import { SportTournament } from '../types';
import { TEAMS, toThaiNumber } from '../constants';

interface AllResultsPrintViewProps {
  tournaments: Record<string, SportTournament>;
  sportsList: any[];
}

const AllResultsPrintView: React.FC<AllResultsPrintViewProps> = ({ tournaments, sportsList }) => {
  return (
    <div id="results-print-container" className="hidden print:block p-8 bg-white text-black min-h-screen">
      <div className="text-center mb-10 border-b-8 border-double border-black pb-8">
        <img 
          src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_8s127m8s127m8s12.png" 
          alt="School Logo" 
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-4xl font-black mb-2 leading-tight">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h1>
        <h2 className="text-xl font-bold italic">สรุปรายงานผลการแข่งขันกีฬาสีสัมพันธ์ ประจำปีการศึกษา ๒๕๖๘</h2>
      </div>

      <table className="w-full border-collapse border-2 border-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-black px-4 py-3 text-center w-12 font-black">ลำดับ</th>
            <th className="border-2 border-black px-4 py-3 text-left font-black">รายการแข่งขัน / รุ่นอายุ</th>
            <th className="border-2 border-black px-4 py-3 text-center font-black">เหรียญทอง</th>
            <th className="border-2 border-black px-4 py-3 text-center font-black">เหรียญเงิน</th>
            <th className="border-2 border-black px-4 py-3 text-center font-black">เหรียญทองแดง</th>
          </tr>
        </thead>
        <tbody>
          {sportsList.map((sport, index) => {
            const t = tournaments[sport.id];
            const champion = TEAMS.find(team => team.id === t?.championId);
            const runnerUp = TEAMS.find(team => team.id === t?.runnerUpId);
            const third = TEAMS.find(team => team.id === t?.secondRunnerUpId);

            return (
              <tr key={sport.id} className="hover:bg-gray-50 transition-colors">
                <td className="border-2 border-black px-4 py-4 text-center font-bold">
                    {toThaiNumber(index + 1)}
                </td>
                <td className="border-2 border-black px-4 py-4">
                    <div className="font-black text-lg leading-none">{sport.name}</div>
                    <div className="text-xs font-bold text-gray-600 mt-1 italic">{sport.category}</div>
                </td>
                <td className="border-2 border-black px-4 py-4 text-center font-black">
                    {champion ? champion.name.split(' ')[0] : '-'}
                </td>
                <td className="border-2 border-black px-4 py-4 text-center font-black">
                    {runnerUp ? runnerUp.name.split(' ')[0] : '-'}
                </td>
                <td className="border-2 border-black px-4 py-4 text-center font-black">
                    {third ? third.name.split(' ')[0] : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-12 mt-20">
        <div className="text-center">
            <p className="mb-12 font-bold">ลงชื่อ ....................................................... กรรมการตัดสิน</p>
            <p className="font-black">( ....................................................... )</p>
        </div>
        <div className="text-center">
            <p className="mb-12 font-bold">ลงชื่อ ....................................................... ผู้รับรองผล</p>
            <p className="font-black">( ....................................................... )</p>
        </div>
      </div>

      <div className="mt-20 text-center opacity-50 text-[10px] font-bold italic">
         เอกสารฉบับนี้พิมพ์โดยระบบจัดการการแข่งขันกีฬาอัตโนมัติ ๒๕๖๘
      </div>
    </div>
  );
};

export default AllResultsPrintView;
