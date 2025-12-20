
import React, { useState } from 'react';
import { Match, Team } from '../types';
import { TEAMS } from '../constants';
import { Trophy, Clock, Lock, AlertCircle, CheckCircle, Activity, Unlock, Key, ShieldAlert, X } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  title: string;
  onUpdate: (match: Match) => void;
  isEditable?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, title, onUpdate, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localScoreA, setLocalScoreA] = useState(match.scoreA);
  const [localScoreB, setLocalScoreB] = useState(match.scoreB);

  // Authorization States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const teamA = TEAMS.find(t => t.id === match.teamAId);
  const teamB = TEAMS.find(t => t.id === match.teamBId);

  const handlePreSave = () => {
    if (localScoreA === localScoreB) {
      setErrorMessage("ห้ามเสมอ");
      return;
    }
    setErrorMessage(null);
    setIsConfirming(true);
  };

  const handleConfirmSave = () => {
    const winnerId = localScoreA > localScoreB ? match.teamAId : match.teamBId;
    
    onUpdate({
        ...match,
        scoreA: localScoreA,
        scoreB: localScoreB,
        winnerId: winnerId,
        status: 'finished'
    });
    setIsConfirming(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsConfirming(false);
    setErrorMessage(null);
    setLocalScoreA(match.scoreA);
    setLocalScoreB(match.scoreB);
  };

  const handleEditClick = () => {
    if (match.status === 'finished') {
      setShowAuthModal(true);
      setPasscode('');
      setPasscodeError(false);
    } else {
      startEditing();
    }
  };

  const startEditing = () => {
    setLocalScoreA(match.scoreA);
    setLocalScoreB(match.scoreB);
    setIsEditing(true);
  };

  const handleVerifyPasscode = () => {
    if (passcode === '1722') {
      setShowAuthModal(false);
      startEditing();
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 1500);
    }
  };

  const TeamDisplay = ({ team, score, isWinner, isSideA }: { team?: Team, score: number, isWinner?: boolean, isSideA: boolean }) => {
    if (!team) return (
      <div className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-24 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
        <span className="text-gray-300 text-[9px] font-black uppercase tracking-widest">รอคู่แข่ง</span>
      </div>
    );

    return (
      <div className={`flex flex-col items-center relative transition-all duration-300 ${isWinner ? 'scale-105' : ''}`}>
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl mb-3 text-white font-black text-xs md:text-sm px-2 text-center leading-tight ${team.tailwindBg} ring-4 ${isWinner ? 'ring-yellow-400' : 'ring-white/80'}`}>
          {isWinner && <Trophy size={20} className="absolute -top-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5 shadow-md" />}
          {team.name.split(' ')[0]}
        </div>
        <span className="text-xs font-black text-gray-700 italic">{team.name.split('(')[0]}</span>
        
        {isEditing ? (
           <div className="mt-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100">
             <button 
               onClick={() => isSideA ? setLocalScoreA(Math.max(0, localScoreA - 1)) : setLocalScoreB(Math.max(0, localScoreB - 1))}
               className="w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all font-black"
             >-</button>
             <span className="text-xl font-black min-w-[24px] text-center text-gray-800">{isSideA ? localScoreA : localScoreB}</span>
             <button 
                onClick={() => isSideA ? setLocalScoreA(localScoreA + 1) : setLocalScoreB(localScoreB + 1)}
                className="w-8 h-8 bg-blue-500 text-white shadow-md rounded-full flex items-center justify-center hover:bg-blue-600 active:scale-90 transition-all font-black"
             >+</button>
           </div>
        ) : (
          <div className={`mt-2 font-black text-4xl md:text-5xl tracking-tighter transition-all ${
            match.status === 'finished' ? 'text-gray-800' : 
            match.status === 'playing' ? 'text-blue-500 animate-pulse' : 
            'text-gray-200'
          }`}>
             {score}
          </div>
        )}
      </div>
    );
  };

  const isReady = match.teamAId && match.teamBId;

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border-4 border-white p-5 md:p-8 relative overflow-hidden transition-all duration-500 ${isEditing ? 'ring-[16px] ring-blue-50/50' : ''}`}>
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 px-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">
            {title}
        </span>
        <div className="flex items-center">
            {match.status === 'finished' ? (
                 <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase italic">
                    <CheckCircle size={12} className="mr-1.5" /> จบการแข่งขัน
                 </span>
            ) : match.status === 'playing' ? (
                <span className="flex items-center text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full animate-pulse uppercase italic">
                    <Activity size={12} className="mr-1.5" /> กำลังแข่งขัน
                </span>
            ) : (
                <span className="flex items-center text-[10px] font-black text-gray-300 uppercase italic">
                    <Clock size={12} className="mr-1.5" /> ยังไม่แข่งขัน
                </span>
            )}
        </div>
      </div>

      {/* Main Match Content */}
      <div className="flex justify-between items-center gap-4">
        <TeamDisplay team={teamA} score={match.scoreA} isWinner={match.winnerId === teamA?.id} isSideA={true} />
        
        <div className="flex flex-col items-center min-w-[100px] md:min-w-[140px]">
            {!isEditing && <span className="text-gray-100 font-black text-3xl mb-4 italic">VS</span>}
            
            {isEditable && isReady && (
                <div className="flex flex-col items-center w-full">
                {isEditing ? (
                    <div className="flex flex-col items-center space-y-4 animate-fade-in w-full">
                        {isConfirming ? (
                             <div className="flex flex-col gap-2 w-full">
                                <span className="text-[10px] text-rose-500 font-black uppercase italic text-center">ยืนยันผล?</span>
                                <button onClick={handleConfirmSave} className="bg-rose-500 text-white text-[11px] font-black px-6 py-3 rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2">
                                    บันทึกผล
                                </button>
                                <button onClick={() => setIsConfirming(false)} className="text-gray-400 text-[10px] font-black hover:text-gray-600 italic mt-1">
                                    กลับไปแก้ไข
                                </button>
                             </div>
                        ) : (
                            <div className="flex flex-col gap-2 w-full">
                                <button onClick={handlePreSave} className="bg-blue-600 text-white text-[13px] font-black px-8 py-3.5 rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                                    เรียบร้อย
                                </button>
                                <button onClick={handleCancel} className="text-gray-400 text-[10px] font-black hover:text-gray-600 italic text-center">
                                    ยกเลิก
                                </button>
                                {errorMessage && (
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 mt-2">
                                        <AlertCircle size={10} /> {errorMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={handleEditClick}
                        className={`text-[10px] font-black px-6 py-2.5 rounded-2xl transition-all border italic uppercase flex items-center gap-2 ${
                          match.status === 'finished' 
                          ? 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50 shadow-sm' 
                          : 'bg-gray-50 text-gray-400 border-transparent hover:bg-blue-50 hover:text-blue-600'
                        }`}
                    >
                        {match.status === 'finished' && <Unlock size={12} />}
                        {match.status === 'finished' ? 'แก้ไขผล' : 'ลงคะแนน'}
                    </button>
                )}
                </div>
            )}
            {!isReady && <Lock size={20} className="text-gray-100 mt-4 opacity-30" />}
        </div>

        <TeamDisplay team={teamB} score={match.scoreB} isWinner={match.winnerId === teamB?.id} isSideA={false} />
      </div>

      {/* Auth Modal for MatchCard */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-fade-in no-print">
              <div className="bg-white rounded-[3.5rem] shadow-3xl max-w-md w-full p-12 border-4 border-white relative overflow-hidden text-center">
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors">
                      <X size={24} />
                  </button>
                  <div className="bg-blue-50 text-blue-500 p-8 rounded-[2.5rem] mb-8 inline-block shadow-sm">
                      <ShieldAlert size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 italic">ต้องการแก้ไขผล?</h3>
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
              </div>
          </div>
      )}
    </div>
  );
};

export default MatchCard;
