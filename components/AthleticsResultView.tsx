
import React, { useState, useEffect } from 'react';
import { SportTournament, Team } from '../types';
import { TEAMS, getIcon, toThaiNumber } from '../constants';
import { Check, Trophy, Medal, Award, Save, RefreshCw, Star, Printer, FileText, Lock, Unlock, Key, ShieldAlert, X, ChevronRight } from 'lucide-react';

interface AthleticsResultViewProps {
  tournament: SportTournament;
  onUpdateWinners: (championId?: string, runnerUpId?: string, secondRunnerUpId?: string) => void;
}

const AthleticsResultView: React.FC<AthleticsResultViewProps> = ({ tournament, onUpdateWinners }) => {
  const [champion, setChampion] = useState<string | undefined>(tournament.championId);
  const [runnerUp, setRunnerUp] = useState<string | undefined>(tournament.runnerUpId);
  const [secondRunnerUp, setSecondRunnerUp] = useState<string | undefined>(tournament.secondRunnerUpId);
  const [isSaving, setIsSaving] = useState(false);
  
  // Authorization States
  const [isLocked, setIsLocked] = useState(!!tournament.championId);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Update internal state when tournament prop changes
  useEffect(() => {
    setChampion(tournament.championId);
    setRunnerUp(tournament.runnerUpId);
    setSecondRunnerUp(tournament.secondRunnerUpId);
    setIsLocked(!!tournament.championId);
  }, [tournament]);

  const handleSave = () => {
    setIsSaving(true);
    const selected = [champion, runnerUp, secondRunnerUp].filter(Boolean);
    const unique = new Set(selected);
    
    if (selected.length < 3 && selected.length > 0) {
        alert("กรุณาเลือกผู้ชนะให้ครบทั้ง ๓ อันดับ");
        setIsSaving(false);
        return;
    }

    if (selected.length !== unique.size) {
        alert("ห้ามเลือกสีซ้ำกันในอันดับที่ ๑, ๒ และ ๓");
        setIsSaving(false);
        return;
    }

    onUpdateWinners(champion, runnerUp, secondRunnerUp);
    setTimeout(() => {
        setIsSaving(false);
        setIsLocked(true);
    }, 800);
  };

  const handleUnlockRequest = () => {
    setShowAuthModal(true);
    setPasscode('');
    setPasscodeError(false);
  };

  const handleVerifyPasscode = () => {
    if (passcode === '1722') {
        setIsLocked(false);
        setShowAuthModal(false);
        setPasscode('');
    } else {
        setPasscodeError(true);
        setTimeout(() => setPasscodeError(false), 1500);
    }
  };

  const handlePrintView = () => {
    document.body.dataset.printMode = 'bracket';
    window.print();
    delete document.body.dataset.printMode;
  };

  const handlePrintReport = () => {
    document.body.dataset.printMode = 'report';
    window.print();
    delete document.body.dataset.printMode;
  };

  const savedChampion = TEAMS.find(t => t.id === tournament.championId);
  const savedRunnerUp = TEAMS.find(t => t.id === tournament.runnerUpId);
  const savedSecondRunnerUp = TEAMS.find(t => t.id === tournament.secondRunnerUpId);
  const hasWinners = !!(savedChampion || savedRunnerUp || savedSecondRunnerUp);

  const TeamSelector = ({ label, icon, value, onChange, colorClass }: any) => (
    <div className={`bg-white rounded-[2rem] p-6 shadow-xl border-2 transition-all duration-500 ${isLocked ? 'opacity-60 border-gray-100 scale-95' : 'border-gray-50 flex-1'}`}>
        <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 ${colorClass}`}>
                {icon}
            </div>
            <h4 className="font-black text-gray-800 text-lg mb-4">{label}</h4>
            <div className="grid grid-cols-2 gap-3 w-full">
                {TEAMS.map(team => (
                    <button
                        key={team.id}
                        disabled={isLocked}
                        onClick={() => onChange(value === team.id ? undefined : team.id)}
                        className={`py-3 px-2 rounded-xl text-[10px] font-black transition-all border-2 flex items-center justify-center gap-1 ${
                            value === team.id 
                            ? `${team.tailwindBg} text-white border-white shadow-lg` 
                            : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                        } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {value === team.id && <Check size={12} strokeWidth={4} />}
                        {team.name.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in relative">
        {/* Action Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[3rem] p-10 text-white mb-8 relative overflow-hidden shadow-2xl no-print">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md border border-white/10">
                        {getIcon(tournament.sportConfig.iconName, 48, "text-yellow-400")}
                    </div>
                    <div>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none">{tournament.sportConfig.name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-blue-200 font-black tracking-widest uppercase text-xs bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20 w-fit">{tournament.sportConfig.category}</p>
                            {isLocked && (
                                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 italic">
                                    <Lock size={12} /> บันทึกแล้ว
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button 
                        onClick={handlePrintView}
                        className="bg-white text-blue-900 px-6 py-4 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-gray-200"
                    >
                        <Printer size={20} />
                        <span>พิมพ์ผลการแข่งขัน</span>
                    </button>
                    
                    {isLocked ? (
                        <button 
                            onClick={handleUnlockRequest}
                            className="bg-rose-500 text-white px-8 py-4 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-rose-700"
                        >
                            <Unlock size={20} />
                            <span>ปลดล็อกเพื่อแก้ไข</span>
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-yellow-600"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกผล'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 no-print mb-10">
            <TeamSelector label="เหรียญทอง (ที่ ๑)" icon={<Trophy size={32} fill="currentColor" />} value={champion} onChange={setChampion} colorClass="bg-yellow-400" />
            <TeamSelector label="เหรียญเงิน (ที่ ๒)" icon={<Medal size={32} fill="currentColor" />} value={runnerUp} onChange={setRunnerUp} colorClass="bg-slate-300" />
            <TeamSelector label="เหรียญทองแดง (ที่ ๓)" icon={<Award size={32} fill="currentColor" />} value={secondRunnerUp} onChange={setSecondRunnerUp} colorClass="bg-orange-400" />
        </div>

        {/* Saved Summary Visual */}
        {hasWinners && (
            <div className="animate-slide-up no-print">
                <div className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] p-10 border-4 border-white shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-slate-300 to-orange-400"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600 shadow-sm"><Star size={24} fill="currentColor" /></div>
                            <h3 className="font-black text-gray-800 text-2xl italic tracking-tight uppercase">สรุปเหรียญรางวัล</h3>
                        </div>
                        <button onClick={handlePrintReport} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                            พิมพ์ใบสรุปรายงาน <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {savedChampion && (
                            <div className="bg-yellow-50/50 border-2 border-yellow-100 rounded-[2.5rem] p-6 flex items-center gap-6 group transition-all">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ring-8 ring-yellow-400/20 ${savedChampion.tailwindBg}`}>
                                    <Trophy size={32} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-yellow-600 tracking-widest uppercase italic">ชนะเลิศ (ทอง)</span>
                                    <span className="text-3xl font-black text-gray-900 leading-none mt-1">{savedChampion.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                        {savedRunnerUp && (
                            <div className="bg-slate-50/50 border-2 border-slate-100 rounded-[2.5rem] p-6 flex items-center gap-6 group transition-all">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ring-8 ring-slate-400/20 ${savedRunnerUp.tailwindBg}`}>
                                    <Medal size={32} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase italic">รองชนะเลิศ ๑ (เงิน)</span>
                                    <span className="text-3xl font-black text-gray-900 leading-none mt-1">{savedRunnerUp.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                        {savedSecondRunnerUp && (
                            <div className="bg-orange-50/50 border-2 border-orange-100 rounded-[2.5rem] p-6 flex items-center gap-6 group transition-all">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ring-8 ring-orange-400/20 ${savedSecondRunnerUp.tailwindBg}`}>
                                    <Award size={32} fill="currentColor" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-orange-600 tracking-widest uppercase italic">รองชนะเลิศ ๒ (ทองแดง)</span>
                                    <span className="text-3xl font-black text-gray-900 leading-none mt-1">{savedSecondRunnerUp.name.split(' ')[0]}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-fade-in no-print">
                <div className="bg-white rounded-[3.5rem] shadow-3xl max-w-md w-full p-12 border-4 border-white relative overflow-hidden text-center">
                    <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors">
                        <X size={24} />
                    </button>
                    <div className="bg-blue-50 text-blue-500 p-8 rounded-[2.5rem] mb-8 inline-block shadow-sm">
                        <ShieldAlert size={64} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-3 italic">ต้องการแก้ไขข้อมูล?</h3>
                    <p className="text-gray-400 font-bold text-sm mb-10 leading-relaxed px-4">กรุณาใส่รหัสผ่านเพื่อปลดล็อกการแก้ไขผลการแข่งขัน</p>
                    
                    <div className={`w-full relative mb-10 ${passcodeError ? 'animate-shake' : ''}`}>
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"><Key size={24} /></div>
                        <input 
                            type="password" 
                            value={passcode} 
                            onChange={(e) => { setPasscode(e.target.value); setPasscodeError(false); }} 
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyPasscode()}
                            placeholder="รหัสผ่าน ๔ หลัก" 
                            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-gray-100 rounded-[2rem] font-black text-3xl focus:outline-none focus:border-blue-500 transition-all text-center tracking-[0.5em]" 
                            autoFocus
                        />
                    </div>
                    
                    <button onClick={handleVerifyPasscode} className="w-full py-5 rounded-[2rem] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all text-xl">
                        ยืนยันตัวตน
                    </button>
                    
                    {passcodeError && (
                        <p className="text-rose-500 font-black text-xs mt-4 animate-bounce">รหัสผ่านไม่ถูกต้อง!</p>
                    )}
                </div>
            </div>
        )}

        {/* OFFICIAL PRINT TEMPLATE */}
        <div id="report-print-container" className="hidden print:block p-12 text-black bg-white">
            <div className="text-center mb-10 border-b-8 border-double border-black pb-8">
                <h1 className="text-5xl font-black mb-2">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h1>
                <h2 className="text-2xl text-gray-700 italic font-bold">รายงานผลการแข่งขันกรีฑาและกีฬาเด็กเล็ก ประจำปีการศึกษา ๒๕๖๘</h2>
            </div>
            <div className="flex justify-between items-center mb-12 px-4">
                <div className="bg-black text-white px-8 py-3 rounded-2xl text-3xl font-black uppercase italic">
                    {tournament.sportConfig.name}
                </div>
                <div className="text-2xl font-black text-gray-500 tracking-widest border-b-4 border-gray-200">
                    รุ่น: {tournament.sportConfig.category}
                </div>
            </div>
            <div className="space-y-8">
                <div className="border-4 border-black p-8 rounded-[3rem] flex items-center justify-between bg-yellow-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-yellow-600 uppercase tracking-widest">รางวัลชนะเลิศ (เหรียญทอง)</span>
                        <span className="text-6xl font-black text-black mt-2">{savedChampion ? savedChampion.name : '...................................................'}</span>
                    </div>
                    <Trophy size={100} className="text-yellow-400" fill="currentColor" />
                </div>
                <div className="border-4 border-black p-8 rounded-[3rem] flex items-center justify-between bg-slate-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-500 uppercase tracking-widest">รางวัลรองชนะเลิศอันดับ ๑ (เหรียญเงิน)</span>
                        <span className="text-5xl font-black text-black mt-2">{savedRunnerUp ? savedRunnerUp.name : '...................................................'}</span>
                    </div>
                    <Medal size={80} className="text-slate-300" fill="currentColor" />
                </div>
                <div className="border-4 border-black p-8 rounded-[3rem] flex items-center justify-between bg-orange-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-orange-600 uppercase tracking-widest">รางวัลรองชนะเลิศอันดับ ๒ (เหรียญทองแดง)</span>
                        <span className="text-5xl font-black text-black mt-2">{savedSecondRunnerUp ? savedSecondRunnerUp.name : '...................................................'}</span>
                    </div>
                    <Award size={80} className="text-orange-300" fill="currentColor" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-12 mt-32">
                <div className="text-center">
                    <div className="mb-12 font-bold text-xl">ลงชื่อ .......................................................</div>
                    <div className="font-black text-lg">กรรมการตัดสิน</div>
                </div>
                <div className="text-center">
                    <div className="mb-12 font-bold text-xl">ลงชื่อ .......................................................</div>
                    <div className="font-black text-lg">ผู้บันทึกข้อมูล</div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AthleticsResultView;
