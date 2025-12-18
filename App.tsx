
import React, { useState, useEffect, useMemo } from 'react';
import { SPORTS_LIST, getIcon, toThaiNumber, TEAMS } from './constants';
import { SportTournament, Match, SportConfig } from './types';
import { initializeTournament, updateTournamentMatch, saveToLocal, loadFromLocal, fetchFromSheets, mergeSheetData, saveToCloud } from './services/tournamentService';
import BracketView from './components/BracketView';
import AthleticsResultView from './components/AthleticsResultView';
import MedalTable from './components/MedalTable';
import BroadcastCard from './components/BroadcastCard';
import MatchResultCard from './components/MatchResultCard';
import OverallPodium from './components/OverallPodium';
import AllMatchesPrintView from './components/AllMatchesPrintView';
import { Home, Trophy, Medal, ChevronLeft, RefreshCw, Database, Check, ListFilter, Printer, FileText, X, ChevronRight, Heart, Sparkles, Activity, Star, Zap, Loader2, Search, Filter, Layers, Target, Dumbbell, Users, User, LayoutGrid, Trash2, AlertTriangle, TrendingUp, Award, ListChecks, TableProperties, Timer, ShieldAlert, Key } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'sports' | 'ranking'>('home');
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasscode, setResetPasscode] = useState('');
  const [resetError, setResetError] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [tournaments, setTournaments] = useState<Record<string, SportTournament>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const localData = loadFromLocal();
        let initialData: Record<string, SportTournament> = {};
        
        SPORTS_LIST.forEach(sport => {
            if (localData && localData[sport.id]) {
                initialData[sport.id] = localData[sport.id];
            } else {
                initialData[sport.id] = initializeTournament(sport);
            }
        });

        try {
            const sheetRows = await fetchFromSheets();
            if (sheetRows && sheetRows.length > 0) {
                const merged = mergeSheetData(initialData, sheetRows);
                setTournaments(merged);
                saveToLocal(merged);
            } else {
                setTournaments(initialData);
                const allMatches = (Object.values(initialData) as SportTournament[]).flatMap(t => t.matches);
                await saveToCloud(allMatches);
                saveToLocal(initialData);
            }
        } catch (e) {
            console.error("Cloud sync failed", e);
            setTournaments(initialData);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  const handleMatchUpdate = (updatedMatch: Match) => {
    const currentTournament = tournaments[updatedMatch.sportId];
    if (!currentTournament) return;
    
    const newTournamentState = updateTournamentMatch(currentTournament, updatedMatch);
    const newTournaments = { ...tournaments, [updatedMatch.sportId]: newTournamentState };
    
    setTournaments(newTournaments);
    saveToLocal(newTournaments); 
    
    const changedMatches = newTournamentState.matches.filter(newMatch => {
        const oldMatch = currentTournament.matches.find(m => m.id === newMatch.id);
        return !oldMatch || JSON.stringify(newMatch) !== JSON.stringify(oldMatch);
    });
    
    if (changedMatches.length > 0) {
        saveToCloud(changedMatches);
    }
  };

  const handleAthleticsUpdate = (championId?: string, runnerUpId?: string, secondRunnerUpId?: string) => {
    if (!selectedSportId) return;
    const current = tournaments[selectedSportId];
    if (!current) return;

    const updated: SportTournament = {
      ...current,
      championId,
      runnerUpId,
      secondRunnerUpId
    };

    const newTournaments = { ...tournaments, [selectedSportId]: updated };
    setTournaments(newTournaments);
    saveToLocal(newTournaments);
    
    const directMatch: Match = {
      id: `m_${selectedSportId}_direct`,
      sportId: selectedSportId,
      round: 'direct',
      scoreA: 0,
      scoreB: 0,
      status: 'finished',
      winnerId: championId 
    };
    saveToCloud([directMatch]);
  };

  const handleManualSync = async () => {
      setIsSyncing(true);
      setSyncStatus('idle');
      try {
        const sheetRows = await fetchFromSheets();
        if (sheetRows && sheetRows.length > 0) {
            setTournaments(prev => {
                const merged = mergeSheetData(prev, sheetRows);
                saveToLocal(merged);
                return merged;
            });
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
             setSyncStatus('success'); 
             setTimeout(() => setSyncStatus('idle'), 3000);
        }
      } catch (e) {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 3000);
      } finally {
          setIsSyncing(false);
      }
  };

  const handleResetAllData = async () => {
      if (resetPasscode !== '1722') {
          setResetError(true);
          setTimeout(() => setResetError(false), 2000);
          return;
      }

      setIsSyncing(true);
      const initialData: Record<string, SportTournament> = {};
      SPORTS_LIST.forEach(sport => {
          initialData[sport.id] = initializeTournament(sport);
      });
      
      setTournaments(initialData);
      saveToLocal(initialData);
      
      const allMatches = (Object.values(initialData) as SportTournament[]).flatMap(t => t.matches);
      await saveToCloud(allMatches);
      
      setIsSyncing(false);
      setShowResetModal(false);
      setResetPasscode('');
      setActiveTab('home');
      setSelectedSportId(null);
  };

  const handleDirectPrintAllResults = () => {
      window.print();
  };

  const standingsData = useMemo(() => {
    const stats: Record<string, { 
      team: typeof TEAMS[0], 
      gold: number, 
      silver: number, 
      bronze: number, 
      points: number, 
      sportsPoints: number,
      athleticsPoints: number,
      total: number 
    }> = {};
    
    TEAMS.forEach(team => {
        stats[team.id] = { team, gold: 0, silver: 0, bronze: 0, points: 0, sportsPoints: 0, athleticsPoints: 0, total: 0 };
    });

    (Object.values(tournaments) as SportTournament[]).forEach(t => {
        const isAthletics = t.sportConfig.type === 'athletics';
        
        const updatePoints = (teamId: string, pts: number) => {
            if (!stats[teamId]) return;
            if (isAthletics) stats[teamId].athleticsPoints += pts;
            else stats[teamId].sportsPoints += pts;
            stats[teamId].points += pts;
        };

        if (t.championId && stats[t.championId]) { 
            stats[t.championId].gold++; 
            updatePoints(t.championId, 3);
            stats[t.championId].total++;
        }
        if (t.runnerUpId && stats[t.runnerUpId]) { 
            stats[t.runnerUpId].silver++; 
            updatePoints(t.runnerUpId, 2);
            stats[t.runnerUpId].total++;
        }
        if (t.secondRunnerUpId && stats[t.secondRunnerUpId]) { 
            stats[t.secondRunnerUpId].bronze++; 
            updatePoints(t.secondRunnerUpId, 1);
            stats[t.secondRunnerUpId].total++;
        }
    });

    return Object.values(stats);
  }, [tournaments]);

  const overallStandings = useMemo(() => {
    return [...standingsData].sort((a, b) => b.points - a.points || b.gold - a.gold);
  }, [standingsData]);

  const sportsStandings = useMemo(() => {
    return [...standingsData].sort((a, b) => b.sportsPoints - a.sportsPoints || b.gold - a.gold);
  }, [standingsData]);

  const athleticsStandings = useMemo(() => {
    return [...standingsData].sort((a, b) => b.athleticsPoints - a.athleticsPoints || b.gold - a.gold);
  }, [standingsData]);

  const finishedSportsBreakdown = useMemo(() => {
    return (Object.values(tournaments) as SportTournament[])
      .filter(t => t.championId)
      .sort((a, b) => a.sportConfig.name.localeCompare(b.sportConfig.name));
  }, [tournaments]);

  const filteredSports = useMemo(() => {
    return SPORTS_LIST.filter(sport => {
        const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             sport.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ทั้งหมด' || 
                                (selectedCategory === 'ลูกบอล' && (sport.type !== 'athletics' && sport.type !== 'chess' && sport.type !== 'checkers' && sport.type !== 'petanque' && sport.type !== 'badminton' && sport.type !== 'tugofwar')) ||
                                (selectedCategory === 'กรีฑา' && sport.type === 'athletics') ||
                                (selectedCategory === 'ทีม' && (sport.iconName === 'Users' || sport.type === 'tugofwar')) ||
                                (selectedCategory === 'บุคคล' && (sport.iconName === 'User' || sport.iconName === 'Dna' || sport.iconName === 'Square' || sport.iconName === 'Hexagon'));
        return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const HomeView = () => (
    <div className="space-y-12 animate-fade-in">
        <header className="w-full relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 rounded-b-[40px] md:rounded-b-[80px] shadow-[0_20px_60px_rgba(37,99,235,0.3)] border-b-4 border-white/20 h-[220px] md:h-[260px] flex items-center no-print">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="track-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 0 15 L 60 15 M 0 45 L 60 45" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#track-pattern)" />
                 </svg>
            </div>
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full animate-[shimmer_8s_infinite]"></div>
            <div className="relative z-10 w-full px-6 flex flex-row items-center justify-center gap-6 md:gap-12">
                <div className="relative group shrink-0">
                    <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-[2rem] md:rounded-[3rem] shadow-2xl ring-8 ring-white/20 animate-float">
                        <img src="https://img2.pic.in.th/pic/Gemini_Generated_Image_u2dku8u2dku8u2dk.png" alt="Logo" className="w-20 h-20 md:w-32 md:h-32 object-contain" />
                    </div>
                </div>
                <div className="text-left">
                    <h1 className="text-white font-black text-4xl md:text-7xl drop-shadow-2xl tracking-tight italic leading-none">การจัดการแข่งขันกีฬาภายในสถานศึกษา</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="bg-yellow-400 p-1.5 rounded-full shadow-lg"><Sparkles className="text-white animate-pulse" size={18} /></div>
                        <div className="bg-black/20 backdrop-blur-md px-6 py-1.5 rounded-full border-2 border-white/20">
                            <h2 className="text-white font-black text-base md:text-xl tracking-wide uppercase">สังกัดเทศบาลตำบลแม่สาย ประจำปีการศึกษา 2568</h2>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 no-print">
            <div className="-mt-12 relative z-20">
                <div className="glass-card rounded-[3rem] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-wrap items-center justify-between gap-4 border-2 border-white">
                    <div className="flex items-center gap-4 pl-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-[1.5rem] text-white shadow-xl rotate-6 transform hover:rotate-0 transition-transform"><Activity size={24} /></div>
                        <div className="flex flex-col">
                            <span className="font-black text-gray-800 text-lg leading-none">แผงควบคุมหลัก</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Management Portal</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleDirectPrintAllResults}
                            className="flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            <Printer size={16} />
                            <span>พิมพ์ตารางสายแข่งรวม</span>
                        </button>
                        <button 
                            onClick={handleManualSync} 
                            disabled={isSyncing} 
                            className={`flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 ${syncStatus === 'success' ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            <span>{isSyncing ? 'ซิงค์...' : 'อัปเดต'}</span>
                        </button>
                        <button 
                            onClick={() => setShowResetModal(true)} 
                            className="flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 border-2 border-rose-100 shadow-sm hover:bg-rose-100 transition-all active:scale-95"
                        >
                            <Trash2 size={16} />
                            <span>ล้างข้อมูล</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600 shadow-sm"><Trophy size={28} /></div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-800 tracking-tighter italic leading-none">ตารางคะแนนรวม</h3>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mt-1">ทอง ๓ • เงิน ๒ • ทองแดง ๑</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black border border-blue-100">
                        <TrendingUp size={16} /> LIVE RANKING
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {overallStandings.map((row, idx) => {
                        const rankGradients = [
                            'from-yellow-400 via-yellow-300 to-yellow-500 shadow-yellow-200/50',
                            'from-slate-300 via-slate-100 to-slate-400 shadow-slate-200/50',
                            'from-orange-400 via-orange-300 to-orange-500 shadow-orange-200/50',
                            'from-gray-100 via-gray-50 to-gray-200 shadow-gray-100'
                        ];
                        
                        return (
                            <div key={row.team.id} className={`group relative bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] ${row.team.tailwindBorder} border-opacity-30`}>
                                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-all duration-500 bg-gradient-to-br border-4 border-white ${idx < 4 ? rankGradients[idx] : rankGradients[3]}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <div className={`absolute -inset-4 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${row.team.tailwindBg}`}></div>
                                        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-sm shadow-2xl ${row.team.tailwindBg} ring-[12px] ring-white transform group-hover:scale-110 transition-transform duration-700 px-2 text-center leading-tight`}>
                                            {row.team.name.split(' ')[0]}
                                        </div>
                                    </div>
                                    <h4 className="text-3xl font-black text-gray-900 mb-1 leading-none drop-shadow-sm">{row.team.name.split(' ')[0]}</h4>
                                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8 italic">{row.team.name.split('(')[1]?.replace(')', '') || 'โรงเรียนเทศบาล ๑'}</div>
                                    <div className="w-full bg-gray-50/80 rounded-[2.5rem] p-6 flex flex-col items-center border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group-hover:bg-white group-hover:shadow-lg transition-all">
                                        <span className="text-5xl font-black text-indigo-600 drop-shadow-sm tracking-tighter">{row.points}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">คะแนนรวม</span>
                                    </div>
                                    <div className="mt-8 flex gap-4">
                                        <div className="flex flex-col items-center group/medal">
                                            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-white flex items-center justify-center shadow-lg mb-2 group-hover/medal:-translate-y-1 transition-transform">
                                                <Trophy size={18} fill="currentColor" />
                                            </div>
                                            <span className="text-sm font-black text-gray-700">{row.gold}</span>
                                        </div>
                                        <div className="flex flex-col items-center group/medal">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-300 text-white flex items-center justify-center shadow-lg mb-2 group-hover/medal:-translate-y-1 transition-transform">
                                                <Medal size={18} fill="currentColor" />
                                            </div>
                                            <span className="text-sm font-black text-gray-700">{row.silver}</span>
                                        </div>
                                        <div className="flex flex-col items-center group/medal">
                                            <div className="w-10 h-10 rounded-2xl bg-orange-400 text-white flex items-center justify-center shadow-lg mb-2 group-hover/medal:-translate-y-1 transition-transform">
                                                <Medal size={18} fill="currentColor" />
                                            </div>
                                            <span className="text-sm font-black text-gray-700">{row.bronze}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-20 group">
                <div className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 rounded-[4rem] p-1.5 shadow-[0_35px_80px_-15px_rgba(30,58,138,0.4)] overflow-hidden">
                    <div className="bg-white/5 backdrop-blur-md rounded-[3.8rem] p-10 md:p-14 text-white relative flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-30"></div>
                        <div className="text-center md:text-left relative z-10">
                            <h3 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-blue-400 italic">Arena Entrance</h3>
                            <p className="text-blue-100/70 font-bold text-lg md:text-xl max-w-sm">เข้าสู่สนามกีฬา เพื่อบันทึกคะแนนและดูตารางการแข่งขัน</p>
                        </div>
                        <button 
                            onClick={() => setActiveTab('sports')} 
                            className="shrink-0 relative z-10 bg-white text-blue-900 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 group-hover:bg-blue-50 flex items-center gap-4 overflow-hidden"
                        >
                            <Trophy size={32} className="text-yellow-500 transform group-hover:rotate-12 transition-transform" fill="currentColor" />
                            <span>เข้าสนาม</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {showResetModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-xl animate-fade-in">
                <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 border-4 border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-rose-100 text-rose-600 p-5 rounded-[2rem] mb-6">
                            <ShieldAlert size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-2 leading-none italic">ล้างข้อมูลทั้งหมด?</h3>
                        <p className="text-gray-400 font-bold text-sm mb-8">การดำเนินการนี้จะลบผลการแข่งขันและสรุปเหรียญทั้งหมด ไม่สามารถกู้คืนได้</p>
                        <div className={`w-full relative mb-8 ${resetError ? 'animate-shake' : ''}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Key size={20} />
                            </div>
                            <input 
                                type="password" 
                                value={resetPasscode}
                                onChange={(e) => {
                                    setResetPasscode(e.target.value);
                                    setResetError(false);
                                }}
                                placeholder="ระบุรหัสผ่านเพื่อยืนยัน"
                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl font-black focus:outline-none transition-all ${resetError ? 'border-rose-300 bg-rose-50' : 'border-gray-100 focus:border-blue-500'}`}
                            />
                            {resetError && (
                                <p className="text-rose-500 text-[10px] font-black mt-2 flex items-center justify-center gap-1">
                                    <AlertTriangle size={12} /> รหัสผ่านไม่ถูกต้อง
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button 
                                onClick={() => { setShowResetModal(false); setResetPasscode(''); }}
                                className="py-4 rounded-2xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleResetAllData}
                                className="py-4 rounded-2xl font-black text-white bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                <span>ยืนยันการล้าง</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const SportSelectionView = () => (
    <div className="min-h-screen animate-fade-in no-print">
        <div className="bg-white/80 backdrop-blur-2xl border-b border-gray-100 sticky top-0 z-[80] shadow-2xl shadow-indigo-900/5 h-[150px]">
            <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className="p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all active:scale-90 hover:shadow-md"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic leading-none">สนามกีฬา</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <p className="text-gray-400 font-black text-[9px] uppercase tracking-[0.2em]">๒๕๖๘ | WAT PHROM VIHAN</p>
                        </div>
                    </div>
                </div>
                <div className="relative flex-grow max-sm:hidden max-w-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"><Search size={18} strokeWidth={3} /></div>
                    <input 
                        type="text" 
                        placeholder="ค้นหากีฬา..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-base font-black text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-indigo-100 focus:ring-8 focus:ring-indigo-50/50 transition-all"
                    />
                </div>
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {[
                    { id: 'ทั้งหมด', label: 'ทั้งหมด', icon: <LayoutGrid size={16} />, bg: 'bg-slate-50', text: 'text-slate-600', active: 'bg-slate-900 text-white' },
                    { id: 'ลูกบอล', label: 'กีฬาบอล', icon: <Target size={16} />, bg: 'bg-emerald-50', text: 'text-emerald-700', active: 'bg-emerald-500 text-white' },
                    { id: 'กรีฑา', label: 'กรีฑา', icon: <Timer size={16} />, bg: 'bg-amber-50', text: 'text-amber-700', active: 'bg-amber-500 text-white' },
                    { id: 'ทีม', label: 'ทีม', icon: <Users size={16} />, bg: 'bg-violet-50', text: 'text-violet-700', active: 'bg-violet-600 text-white' },
                    { id: 'บุคคล', label: 'บุคคล', icon: <User size={16} />, bg: 'bg-rose-50', text: 'text-rose-700', active: 'bg-rose-500 text-white' }
                ].map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-3.5 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap flex items-center gap-2 border-2 border-transparent shadow-sm ${selectedCategory === cat.id ? cat.active : `${cat.bg} ${cat.text} hover:bg-white hover:border-gray-100`}`}
                    >
                        {cat.icon}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-[180px]">
            {filteredSports.length > 0 ? filteredSports.map((sport, index) => {
                const tournament = tournaments[sport.id];
                const isFinished = tournament?.championId;
                const champion = TEAMS.find(t => t.id === tournament?.championId);
                const style = sport.type === 'athletics' ? { grad: 'from-amber-50 to-amber-100', iconBg: 'bg-amber-500', text: 'text-amber-900' } : (sport.type === 'football' || sport.type === 'futsal' ? { grad: 'from-emerald-50 to-emerald-100', iconBg: 'bg-emerald-500', text: 'text-emerald-900' } : { grad: 'from-blue-50 to-blue-100', iconBg: 'bg-blue-600', text: 'text-blue-900' });
                return (
                    <div 
                        key={sport.id} 
                        onClick={() => setSelectedSportId(sport.id)} 
                        className={`group relative overflow-hidden p-10 rounded-[3.5rem] transition-all cursor-pointer bg-gradient-to-br ${style.grad} border-4 ${isFinished ? 'border-green-300 shadow-2xl' : 'border-white shadow-xl'} hover:-translate-y-4 transition-all duration-500`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="absolute -right-8 -bottom-8 text-black/5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                            {getIcon(sport.iconName, 240)}
                        </div>
                        <div className="relative z-10 flex justify-between items-start mb-10">
                            <div className={`p-5 rounded-3xl transition-all shadow-xl text-white ${style.iconBg} group-hover:rotate-12`}>
                                {getIcon(sport.iconName, 32)}
                            </div>
                            {isFinished && (
                                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg ring-4 ring-white">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                        <div className="relative z-10">
                            <h3 className={`text-3xl font-black ${style.text} mb-2 tracking-tighter italic leading-tight`}>{sport.name}</h3>
                            <div className="text-xs font-black text-black/40 uppercase tracking-widest">{sport.category}</div>
                        </div>
                        <div className="relative z-10 mt-10 pt-10 border-t-2 border-black/5 flex items-center justify-between">
                             {isFinished && champion ? (
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[10px] ${champion.tailwindBg} shadow-lg ring-2 ring-white`}>
                                        {champion.name.split(' ')[0]}
                                    </div>
                                    <div className="font-black text-gray-800 text-sm">ชนะเลิศ</div>
                                </div>
                             ) : (
                                <span className="text-xs font-black text-black/30 italic">รอผลการแข่งขัน...</span>
                             )}
                             <div className="bg-white/80 p-3 rounded-2xl text-blue-600 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <ChevronRight size={20} strokeWidth={3} />
                             </div>
                        </div>
                    </div>
                );
            }) : null}
        </div>
    </div>
  );

  const RankingView = () => (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in no-print pb-[180px]">
        <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic leading-none mb-4 uppercase">Medal Standings</h2>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em]">Official Athletic Records ๒๕๖๘</p>
        </div>

        <div className="mb-24">
            <OverallPodium standings={overallStandings as any} />
        </div>

        {/* Section: Overall */}
        <div className="mb-20">
            <div className="flex items-center gap-4 mb-8 pl-4 border-l-8 border-indigo-600">
                <Trophy size={32} className="text-indigo-600" />
                <h3 className="text-3xl font-black text-gray-800 italic uppercase">คะแนนรวมทั้งหมด</h3>
            </div>
            <MedalTable standings={overallStandings as any} />
        </div>

        {/* Section: Sports (Team) */}
        <div className="mb-20">
            <div className="flex items-center gap-4 mb-8 pl-4 border-l-8 border-emerald-500">
                <Activity size={32} className="text-emerald-500" />
                <h3 className="text-3xl font-black text-gray-800 italic uppercase">อันดับคะแนนกีฬาประเภททีม</h3>
            </div>
            <MedalTable standings={sportsStandings as any} hideAthletics={true} />
        </div>

        {/* Section: Athletics */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8 pl-4 border-l-8 border-amber-500">
                <Timer size={32} className="text-amber-500" />
                <h3 className="text-3xl font-black text-gray-800 italic uppercase">อันดับคะแนนกรีฑาและกีฬาเด็กเล็ก</h3>
            </div>
            <MedalTable standings={athleticsStandings as any} hideSports={true} />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-800 relative bg-[#fdfcfb] flex flex-col">
      <div id="master-print-container" style={{ display: 'none' }}>
        <AllMatchesPrintView tournaments={tournaments} sportsList={SPORTS_LIST} />
      </div>

      <main className="flex-grow">
        {isLoading ? (
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 border-8 border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
                    <Trophy size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                </div>
                <span className="font-black text-gray-400 italic mt-8 text-xl animate-pulse">กำลังโหลดข้อมูล...</span>
            </div>
        ) : selectedSportId ? (
            <div className="pt-10 px-6 animate-slide-up max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-center mb-12 no-print">
                    <button onClick={() => setSelectedSportId(null)} className="flex items-center gap-4 text-gray-800 font-black bg-white px-8 py-4 rounded-[2rem] shadow-xl hover:scale-105 transition-all active:scale-95 border-2 border-gray-50"><ChevronLeft size={24} className="text-blue-600" /><span>กลับสู่สนาม</span></button>
                </div>
                {tournaments[selectedSportId] && (
                    tournaments[selectedSportId].sportConfig.type === 'athletics' ? (
                        <AthleticsResultView 
                            tournament={tournaments[selectedSportId]} 
                            onUpdateWinners={handleAthleticsUpdate} 
                        />
                    ) : (
                        <BracketView tournament={tournaments[selectedSportId]} onUpdateMatch={handleMatchUpdate} />
                    )
                )}
            </div>
        ) : (
            <>
                {activeTab === 'home' && <HomeView />}
                {activeTab === 'sports' && <SportSelectionView />}
                {activeTab === 'ranking' && <RankingView />}
            </>
        )}
      </main>

      <footer className="w-full py-16 text-center no-print pb-[140px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30 -z-10"></div>
          <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-pink-500 rounded-full"></div>
                  <Sparkles className="text-pink-500 animate-pulse" size={24} />
                  <div className="h-1 w-12 bg-gradient-to-l from-transparent to-pink-500 rounded-full"></div>
              </div>
              <p className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent text-[18px] font-black uppercase tracking-[0.4em] italic drop-shadow-sm leading-relaxed transition-all hover:tracking-[0.5em] duration-700 cursor-default">
                  พัฒนาและออกแบบโดย Krukai &copy; ๒๕๖๘
              </p>
              <div className="mt-4 flex justify-center gap-6 text-[10px] font-black text-gray-400 tracking-widest uppercase italic">
                  <span>Innovation</span>
                  <span className="text-pink-300">•</span>
                  <span>Education</span>
                  <span className="text-pink-300">•</span>
                  <span>Athletics</span>
              </div>
          </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 w-full h-[90px] z-[90] print:hidden no-print">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            <svg viewBox="0 0 400 90" className="w-full h-full filter drop-shadow-[0_-15px_30px_rgba(0,0,0,0.05)]" preserveAspectRatio="none">
                <path d="M0,90 L400,90 L400,25 Q200,-15 0,25 Z" fill="rgba(255,255,255,0.98)" className="backdrop-blur-2xl" />
            </svg>
        </div>
        <div className="relative h-full flex items-center justify-around px-8 max-w-2xl mx-auto">
            <button onClick={() => { setActiveTab('home'); setSelectedSportId(null); setSearchQuery(''); }} className="flex flex-col items-center justify-center w-20 relative group">
                <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeTab === 'home' ? 'bg-blue-600 text-white -translate-y-10 scale-110 shadow-2xl ring-8 ring-white' : 'text-gray-300'}`}>
                    <Home size={28} />
                </div>
                <span className={`absolute bottom-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'home' ? 'text-blue-600' : 'opacity-0'}`}>Home</span>
            </button>
            <button onClick={() => { setActiveTab('sports'); setSelectedSportId(null); }} className="flex flex-col items-center justify-center w-20 relative group">
                <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeTab === 'sports' ? 'bg-orange-500 text-white -translate-y-10 scale-110 shadow-2xl ring-8 ring-white' : 'text-gray-300'}`}>
                    <Trophy size={28} />
                </div>
                <span className={`absolute bottom-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'sports' ? 'text-orange-500' : 'opacity-0'}`}>Arena</span>
            </button>
            <button onClick={() => { setActiveTab('ranking'); setSelectedSportId(null); setSearchQuery(''); }} className="flex flex-col items-center justify-center w-20 relative group">
                <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${activeTab === 'ranking' ? 'bg-pink-500 text-white -translate-y-10 scale-110 shadow-2xl ring-8 ring-white' : 'text-gray-300'}`}>
                    <Medal size={28} />
                </div>
                <span className={`absolute bottom-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'ranking' ? 'text-pink-500' : 'opacity-0'}`}>Ranking</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;

