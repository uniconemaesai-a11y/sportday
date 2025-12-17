import React, { useState } from 'react';
import { Match, Team } from '../types';
import { TEAMS } from '../constants';
import { Trophy, Clock, Lock, AlertCircle, CheckCircle, Activity } from 'lucide-react';

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

  const TeamDisplay = ({ team, score, isWinner }: { team?: Team, score: number, isWinner?: boolean }) => {
    if (!team) return (
      <div className="flex flex-col items-center justify-center h-24 w-24 bg-gray-50 rounded-[1.5rem] border-2 border-dashed border-gray-200">
        <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">รอคู่แข่ง</span>
      </div>
    );

    return (
      <div className={`flex flex-col items-center relative ${isWinner ? 'scale-110 transition-transform' : ''}`}>
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-xl mb-3 text-white font-black text-xs md:text-sm px-1 text-center leading-tight ${team.tailwindBg} ring-4 ${isWinner ? 'ring-yellow-400' : 'ring-white'}`}>
          {isWinner && <Trophy size={20} className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-sm bg-white rounded-full p-0.5" />}
          {team.name.split(' ')[0]}
        </div>
        <span className="text-xs font-black text-gray-700 max-w-[80px] text-center truncate italic">{team.name.split('(')[0]}</span>
        
        {isEditing ? (
           <div className="mt-3 flex items-center space-x-2 bg-gray-50 p-1 rounded-full border border-gray-100">
             <button 
               onClick={() => team.id === match.teamAId ? setLocalScoreA(Math.max(0, localScoreA - 1)) : setLocalScoreB(Math.max(0, localScoreB - 1))}
               className="w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all font-black"
             >-</button>
             <span className="text-xl font-black min-w-[24px] text-center">{team.id === match.teamAId ? localScoreA : localScoreB}</span>
             <button 
                onClick={() => team.id === match.teamAId ? setLocalScoreA(localScoreA + 1) : setLocalScoreB(localScoreB + 1)}
                className="w-8 h-8 bg-blue-600 text-white shadow-md rounded-full flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all font-black"
             >+</button>
           </div>
        ) : (
          <div className={`mt-3 px-6 py-1.5 rounded-2xl font-black text-4xl md:text-5xl transition-all shadow-sm ${
            match.status === 'finished' ? 'text-gray-900 bg-gray-50/50' : 
            match.status === 'playing' ? 'text-blue-600 bg-blue-50/50 animate-pulse' : 
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
    <div className={`bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-xl border-4 border-white p-6 mb-6 relative overflow-hidden transition-all ${isEditing ? 'ring-[12px] ring-blue-50' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-gray-100 pb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full italic">
            {title}
        </span>
        <div className="flex items-center space-x-2">
            {match.status === 'finished' ? (
                 <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase italic">
                    <CheckCircle size={12} className="mr-1.5" /> จบการแข่งขัน
                 </span>
            ) : match.status === 'playing' ? (
                <span className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse uppercase italic">
                    <Activity size={12} className="mr-1.5" /> กำลังแข่งขัน
                </span>
            ) : (
                <span className="flex items-center text-[10px] font-black text-gray-400 uppercase italic">
                    <Clock size={12} className="mr-1.5" /> ยังไม่แข่ง
                </span>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-center px-2 md:px-8">
        <TeamDisplay team={teamA} score={match.scoreA} isWinner={match.winnerId === teamA?.id} />
        
        <div className="flex flex-col items-center z-10 mx-4">
            {!isEditing && (
                <div className="flex flex-col items-center">
                    <span className="text-gray-200 font-black text-2xl mb-2 italic">VS</span>
                </div>
            )}
            
            {/* Action Buttons */}
            {isEditable && isReady && (
                <div className="mt-2">
                {isEditing ? (
                    <div className="flex flex-col items-center space-y-3 min-w-[120px]">
                        {isConfirming ? (
                             <div className="flex flex-col space-y-2 animate-fade-in text-center">
                                <span className="text-[10px] text-rose-500 font-black uppercase italic">ยืนยันผลการแข่ง?</span>
                                <button onClick={handleConfirmSave} className="bg-rose-600 text-white text-[11px] font-black px-6 py-2 rounded-xl hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={14} /> บันทึกผล
                                </button>
                                <button onClick={() => setIsConfirming(false)} className="text-gray-400 text-[10px] font-black hover:text-gray-600 italic">
                                    กลับไปแก้ไข
                                </button>
                             </div>
                        ) : (
                            <>
                                <button onClick={handlePreSave} className="bg-blue-600 text-white text-[11px] font-black px-8 py-2.5 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all w-full">
                                    เรียบร้อย
                                </button>
                                <button onClick={handleCancel} className="text-gray-400 text-[10px] font-black hover:text-gray-600 italic">
                                    ยกเลิก
                                </button>
                                {errorMessage && (
                                    <span className="text-[9px] font-black text-rose-500 flex items-center bg-rose-50 px-2.5 py-1 rounded-full whitespace-nowrap border border-rose-100">
                                        <AlertCircle size={10} className="mr-1" /> {errorMessage}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={() => {
                            setLocalScoreA(match.scoreA);
                            setLocalScoreB(match.scoreB);
                            setIsEditing(true);
                        }}
                        className="bg-white text-blue-600 text-[10px] font-black px-5 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all border-2 border-blue-50 italic uppercase"
                    >
                        {match.status === 'finished' ? 'แก้ไขผล' : 'ลงคะแนน'}
                    </button>
                )}
                </div>
            )}
            {!isReady && <Lock size={20} className="text-gray-200 mt-4" />}
        </div>

        <TeamDisplay team={teamB} score={match.scoreB} isWinner={match.winnerId === teamB?.id} />
      </div>
    </div>
  );
};

export default MatchCard;
