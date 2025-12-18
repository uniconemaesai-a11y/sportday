
import React, { useState } from 'react';
import { SportTournament, Team } from '../types';
import { TEAMS, getIcon, toThaiNumber } from '../constants';
import { Check, Trophy, Medal, Award, Save, RefreshCw, Star, Printer } from 'lucide-react';

interface AthleticsResultViewProps {
  tournament: SportTournament;
  onUpdateWinners: (championId?: string, runnerUpId?: string, secondRunnerUpId?: string) => void;
}

const AthleticsResultView: React.FC<AthleticsResultViewProps> = ({ tournament, onUpdateWinners }) => {
  const [champion, setChampion] = useState<string | undefined>(tournament.championId);
  const [runnerUp, setRunnerUp] = useState<string | undefined>(tournament.runnerUpId);
  const [secondRunnerUp, setSecondRunnerUp] = useState<string | undefined>(tournament.secondRunnerUpId);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // ตรวจสอบห้ามเลือกสีซ้ำ
    const selected = [champion, runnerUp, secondRunnerUp].filter(Boolean);
    const unique = new Set(selected);
    
    if (selected.length !== unique.size) {
        alert("ห้ามเลือกสีซ้ำกันในอันดับที่ ๑, ๒ และ ๓");
        setIsSaving(false);
        return;
    }

    onUpdateWinners(champion, runnerUp, secondRunnerUp);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handlePrint = () => {
    window.print();
  };

  const savedChampion = TEAMS.find(t => t.id === tournament.championId);
  const savedRunnerUp = TEAMS.find(t => t.id === tournament.runnerUpId);
  const savedSecondRunnerUp = TEAMS.find(t => t.id === tournament.secondRunnerUpId);
  const hasWinners = !!(savedChampion || savedRunnerUp || savedSecondRunnerUp);

  const TeamSelector = ({ label, icon, value, onChange, colorClass }: any) => (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border-2 border-gray-50 flex flex-col items-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 ${colorClass}`}>
            {icon}
        </div>
        <h4 className="font-black text-gray-800 text-lg mb-4">{label}</h4>
        <div className="grid grid-cols-2 gap-3 w-full">
            {TEAMS.map(team => (
                <button
                    key={team.id}
                    onClick={() => onChange(value === team.id ? undefined : team.id)}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black transition-all border-2 flex items-center justify-center gap-1 ${
                        value === team.id 
                        ? `${team.tailwindBg} text-white border-white shadow-lg` 
                        : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                    }`}
                >
                    {value === team.id && <Check size={12} strokeWidth={4} />}
                    {team.name.split(' ')[0]}
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[3rem] p-10 text-white mb-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md border border-white/10">
                        {getIcon(tournament.sportConfig.iconName, 48, "text-yellow-400")}
                    </div>
                    <div>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none">{tournament.sportConfig.name}</h2>
                        <p className="text-blue-200 font-black tracking-widest uppercase text-xs mt-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20 w-fit">{tournament.sportConfig.category}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="bg-white text-blue-900 px-8 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-gray-200 no-print"
                    >
                        <Printer size={24} />
                        <span>พิมพ์ผลการแข่งขัน</span>
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-yellow-400 text-blue-900 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-yellow-600 no-print"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                        <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกผลผู้ชนะ'}</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Saved Winners Summary Card */}
        {hasWinners && (
            <div className="mb-10 animate-slide-up">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border-4 border-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-slate-300 to-orange-400"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <Star className="text-yellow-500 animate-pulse" size={20} fill="currentColor" />
                        <h3 className="font-black text-gray-800 text-xl italic tracking-tight uppercase">สรุปผลการแข่งขันที่บันทึกแล้ว</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {savedChampion && (
                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-3xl p-5 flex items-center gap-5 group transition-all hover:bg-yellow-50">
                                <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg ring-4 ring-yellow-100 group-hover:scale-110 transition-transform">
                                    <Trophy size={28} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-yellow-600 tracking-widest uppercase italic">เหรียญทอง (ที่ ๑)</span>
                                    <span className="text-2xl font-black text-gray-900 leading-none mt-1">{savedChampion.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                        {savedRunnerUp && (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex items-center gap-5 group transition-all hover:bg-slate-50">
                                <div className="w-14 h-14 rounded-2xl bg-slate-300 flex items-center justify-center text-white shadow-lg ring-4 ring-slate-100 group-hover:scale-110 transition-transform">
                                    <Medal size={28} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase italic">เหรียญเงิน (ที่ ๒)</span>
                                    <span className="text-2xl font-black text-gray-900 leading-none mt-1">{savedRunnerUp.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                        {savedSecondRunnerUp && (
                            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 flex items-center gap-5 group transition-all hover:bg-orange-50">
                                <div className="w-14 h-14 rounded-2xl bg-orange-400 flex items-center justify-center text-white shadow-lg ring-4 ring-orange-100 group-hover:scale-110 transition-transform">
                                    <Award size={28} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-orange-600 tracking-widest uppercase italic">เหรียญทองแดง (ที่ ๓)</span>
                                    <span className="text-2xl font-black text-gray-900 leading-none mt-1">{savedSecondRunnerUp.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 no-print">
            <TeamSelector 
                label="เหรียญทอง (ที่ ๑)" 
                icon={<Trophy size={32} fill="currentColor" />}
                value={champion}
                onChange={setChampion}
                colorClass="bg-yellow-400"
            />
            <TeamSelector 
                label="เหรียญเงิน (ที่ ๒)" 
                icon={<Medal size={32} fill="currentColor" />}
                value={runnerUp}
                onChange={setRunnerUp}
                colorClass="bg-slate-300"
            />
            <TeamSelector 
                label="เหรียญทองแดง (ที่ ๓)" 
                icon={<Award size={32} fill="currentColor" />}
                value={secondRunnerUp}
                onChange={setSecondRunnerUp}
                colorClass="bg-orange-400"
            />
        </div>

        <div className="mt-12 bg-white/50 backdrop-blur-md rounded-[2rem] p-8 border-2 border-white text-center no-print">
            <p className="text-gray-400 font-black italic">กรุณาเลือกสีที่ได้รับรางวัลในแต่ละอันดับ และกดปุ่มบันทึกผลที่ด้านบนเพื่ออัปเดตเหรียญรางวัล</p>
        </div>
    </div>
  );
};

export default AthleticsResultView;
