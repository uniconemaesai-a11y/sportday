
import React, { useState, useEffect, useMemo } from 'react';
import { SPORTS_LIST, getIcon, toThaiNumber, TEAMS } from './constants';
import { SportTournament, Match, SportConfig } from './types';
import { initializeTournament, updateTournamentMatch, saveToLocal, loadFromLocal, fetchFromSheets, mergeSheetData, saveToCloud } from './services/tournamentService';
import BracketView from './components/BracketView';
import AthleticsResultView from './components/AthleticsResultView';
import MedalTable from './components/MedalTable';
import SportWinnersGrid from './components/SportWinnersGrid';
import OverallPodium from './components/OverallPodium';
import AllMatchesPrintView from './components/AllMatchesPrintView';
import AllResultsPrintView from './components/AllResultsPrintView';
import BroadcastCard from './components/BroadcastCard';
import { Home, Trophy, Medal, ChevronLeft, RefreshCw, Check, Printer, FileText, ChevronRight, Sparkles, Activity, Star, Loader2, Search, LayoutGrid, Trash2, AlertTriangle, Timer, ShieldAlert, Key, ClipboardList, Target, Users, User, Crown, TrendingUp, Award, Zap } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'sports' | 'results' | 'ranking'>('home');
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasscode, setResetPasscode] = useState('');
  const [resetError, setResetError] = useState(false);
  const [tournaments, setTournaments] = useState<Record<string, SportTournament>>({});
  
  // Printing States
  const [isPrintingBrackets, setIsPrintingBrackets] = useState(false);
  const [isPrintingResults, setIsPrintingResults] = useState(false);

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

  const handlePrintAllBrackets = () => {
    setIsPrintingBrackets(true);
    setIsPrintingResults(false);
    setTimeout(() => {
        window.print();
        setIsPrintingBrackets(false);
    }, 500);
  };

  const handlePrintAllResults = () => {
    setIsPrintingResults(true);
    setIsPrintingBrackets(false);
    setTimeout(() => {
        window.print();
        setIsPrintingResults(false);
    }, 500);
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

  const finishedTournaments = useMemo(() => {
    return (Object.values(tournaments) as SportTournament[])
      .filter(t => t.championId)
      .sort((a, b) => a.sportConfig.name.localeCompare(b.sportConfig.name));
  }, [tournaments]);

  const filteredSports = useMemo(() => {
    return SPORTS_LIST.filter(sport => {
      const lowerSearch = searchQuery.toLowerCase();
      const matchesSearch = sport.name.toLowerCase().includes(lowerSearch) || 
                           sport.category.toLowerCase().includes(lowerSearch);
      
      if (selectedCategory === 'ทั้งหมด') return matchesSearch;
      
      let matchesCategory = false;
      if (selectedCategory === 'ลูกบอล') {
        matchesCategory = ['football', 'handball', 'chairball', 'volleyball', 'futsal', 'petanque'].includes(sport.type);
      } else if (selectedCategory === 'กรีฑา') {
        matchesCategory = sport.type === 'athletics';
      } else if (selectedCategory === 'ทีม') {
        matchesCategory = !['chess', 'checkers', 'badminton', 'athletics'].includes(sport.type) || sport.name.includes('ทีม') || sport.name.includes('ผลัด');
      } else if (selectedCategory === 'บุคคล') {
        matchesCategory = ['chess', 'checkers', 'badminton'].includes(sport.type) || (sport.type === 'athletics' && !sport.name.includes('ผลัด'));
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const GlobalHeader = () => (
    <header className="w-full relative h-[150px] bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 shadow-xl no-print flex items-center px-6 md:px-16 overflow-hidden border-b-8 border-white/30 shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="flex items-center gap-10 relative z-10 w-full">
            <div className="bg-white/90 p-2 rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                <img src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_8s127m8s127m8s12.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <div className="flex flex-col text-left">
                <h1 className="text-white font-black text-2xl md:text-4xl lg:text-5xl italic leading-none drop-shadow-lg tracking-tighter">
                    การจัดการแข่งขันกีฬาภายในสถานศึกษา
                </h1>
                <div className="flex items-center gap-3 mt-2">
                    <div className="bg-yellow-400 p-1 rounded-full shadow-lg"><Sparkles className="text-white" size={14} /></div>
                    <span className="text-white font-bold text-xs md:text-sm uppercase tracking-widest bg-black/20 px-4 py-1 rounded-full border border-white/20 backdrop-blur-md">
                        โรงเรียนเทศบาล ๑ วัดพรหมวิหาร ประจำปีการศึกษา ๒๕๖๘
                    </span>
                </div>
            </div>
        </div>
    </header>
  );

  const HomeView = () => (
    <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 no-print">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-2xl border-4 border-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 pl-4">
                    <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg"><Zap size={20} /></div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-800 text-lg leading-none italic tracking-tight">แผงควบคุมหลัก</span>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Management Portal</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handlePrintAllBrackets} className="flex items-center gap-2 text-[10px] font-black px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:scale-105 transition-all">
                        <Printer size={14} />
                        <span>พิมพ์สายแข่งรวมทั้งหมด</span>
                    </button>
                    <button onClick={handlePrintAllResults} className="flex items-center gap-2 text-[10px] font-black px-6 py-3 rounded-full bg-emerald-600 text-white shadow-lg hover:scale-105 transition-all">
                        <FileText size={14} />
                        <span>พิมพ์ใบสรุปผลรวม</span>
                    </button>
                    <button onClick={handleManualSync} disabled={isSyncing} className="flex items-center gap-2 text-[10px] font-black px-6 py-3 rounded-full bg-white text-gray-500 border border-gray-100 hover:shadow-md transition-all">
                        <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                        <span>อัปเดตข้อมูล</span>
                    </button>
                    <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 text-[10px] font-black px-6 py-3 rounded-full bg-rose-50 text-rose-500 border border-rose-100 transition-all hover:bg-rose-100">
                        <Trash2 size={12} />
                        <span>ล้างข้อมูลสนาม</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* ส่วนแสดงคะแนนรวม */}
            <section className="mb-20">
                <div className="flex items-center gap-4 mb-10 pl-2">
                    <div className="bg-yellow-100 p-3.5 rounded-[1.5rem] text-yellow-600 shadow-sm border border-yellow-200"><Trophy size={32} /></div>
                    <div className="flex-grow">
                        <h3 className="text-4xl font-black text-gray-800 tracking-tighter italic uppercase leading-none">ตารางคะแนนรวม</h3>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest italic mt-2">Soft Tones • Live Standing</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-full text-[10px] font-black border border-emerald-100 flex items-center gap-2 animate-pulse">
                        <TrendingUp size={14} /> OFFICIAL DATA
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {overallStandings.map((row, idx) => (
                        <div key={row.team.id} className="relative group">
                            <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full border-4 border-white shadow-2xl z-20 flex items-center justify-center font-black text-xl italic ${
                                idx === 0 ? 'bg-yellow-400 text-white' : 
                                idx === 1 ? 'bg-slate-300 text-white' : 
                                idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {idx + 1}
                            </div>
                            <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border-4 border-white transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl flex flex-col items-center">
                                <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl mb-8 ring-8 ring-gray-50/50 ${row.team.tailwindBg} transform group-hover:rotate-12 transition-transform duration-700`}>
                                    <span className="text-white font-black text-2xl italic drop-shadow-md">{row.team.name.split(' ')[0]}</span>
                                </div>
                                <h4 className="text-3xl font-black text-gray-800 mb-1 leading-none italic">{row.team.name.split(' ')[0]}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic mb-8">{row.team.name.split('(')[1]?.replace(')', '')}</p>
                                <div className="w-full bg-gray-50/50 rounded-[2.5rem] p-8 flex flex-col items-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                                    <span className="text-6xl font-black text-gray-900 tracking-tighter group-hover:text-blue-600 transition-colors">{row.points}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">คะแนนสะสม</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Hall of Fame */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-12 pl-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3.5 rounded-[1.5rem] text-blue-600 shadow-sm border border-blue-200"><Star size={32} /></div>
                        <div>
                            <h3 className="text-4xl font-black text-gray-800 tracking-tighter italic uppercase leading-none">Hall of Fame</h3>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mt-2">สรุปผลชนะเลิศแต่ละรายการแข่งขัน</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('results')} className="text-blue-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all italic bg-white px-6 py-3 rounded-full border border-blue-100 shadow-sm">
                        ดูผลทั้งหมด <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {finishedTournaments.length > 0 ? (
                        finishedTournaments.slice(0, 12).map((t, idx) => (
                            <BroadcastCard 
                                key={t.sportConfig.id}
                                sportName={t.sportConfig.name}
                                category={t.sportConfig.category}
                                championId={t.championId}
                                runnerUpId={t.runnerUpId}
                                secondRunnerUpId={t.secondRunnerUpId}
                                delay={idx * 60}
                            />
                        ))
                    ) : (
                        <div className="col-span-full bg-white/60 backdrop-blur-md rounded-[3.5rem] p-24 text-center border-4 border-dashed border-gray-200">
                            <Activity className="mx-auto text-gray-200 mb-6" size={80} />
                            <h4 className="text-3xl font-black text-gray-300 italic">รอการสรุปผลการแข่งขัน...</h4>
                        </div>
                    )}
                </div>
            </section>

            {/* Arena Entrance */}
            <div className="group relative no-print mb-16">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-blue-900 rounded-[2.5rem] h-[100px] shadow-2xl overflow-hidden flex items-center justify-between px-12 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="bg-white/10 p-3 rounded-2xl text-blue-300 animate-pulse border border-white/10">
                            <Trophy size={36} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-none">Arena Entrance</h3>
                            <p className="text-blue-200/60 font-bold text-[11px] mt-1 tracking-wider uppercase">เข้าสู่ศูนย์ควบคุมการแข่งขันและบันทึกคะแนน</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('sports')} className="relative z-10 bg-white text-blue-900 px-10 py-3.5 rounded-[1.8rem] font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 group-hover:bg-blue-50 flex items-center gap-4">
                        <span>เข้าสู่สนาม</span>
                        <ChevronRight size={28} className="text-blue-500" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const SportSelectionView = () => (
    <div className="min-h-screen animate-fade-in no-print">
        <div className="bg-white/70 backdrop-blur-2xl border-b-2 border-white/50 sticky top-0 z-[80] shadow-xl h-[80px] flex items-center">
            <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => setActiveTab('home')} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm active:scale-90">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic leading-none">สนามกีฬา</h2>
                        <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest mt-1">Arena Control</span>
                    </div>
                </div>
                <div className="relative flex-grow max-sm:hidden max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="text" placeholder="ค้นหาการแข่งขัน..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                </div>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-10">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
                {[
                    { id: 'ทั้งหมด', label: 'ทั้งหมด', icon: <LayoutGrid size={16} />, active: 'bg-blue-600 text-white shadow-blue-100' },
                    { id: 'ลูกบอล', label: 'กีฬาบอล', icon: <Target size={16} />, active: 'bg-emerald-500 text-white shadow-emerald-100' },
                    { id: 'กรีฑา', label: 'กรีฑา', icon: <Timer size={16} />, active: 'bg-amber-500 text-white shadow-amber-100' },
                    { id: 'ทีม', label: 'ทีม', icon: <Users size={16} />, active: 'bg-indigo-600 text-white shadow-indigo-100' },
                    { id: 'บุคคล', label: 'บุคคล', icon: <User size={16} />, active: 'bg-rose-500 text-white shadow-rose-100' }
                ].map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-8 py-4 rounded-full text-[11px] font-black transition-all flex items-center gap-3 border-2 shadow-sm ${selectedCategory === cat.id ? `${cat.active} border-transparent scale-105` : 'bg-white text-gray-500 border-white hover:border-gray-100'}`}>
                        {cat.icon}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 pb-[180px]">
                {filteredSports.map((sport) => {
                    const tournament = tournaments[sport.id];
                    const isFinished = tournament?.championId;
                    const champion = TEAMS.find(t => t.id === tournament?.championId);
                    return (
                        <div key={sport.id} onClick={() => setSelectedSportId(sport.id)} className="group bg-white/80 backdrop-blur-sm rounded-[3.5rem] p-10 shadow-xl border-4 border-white transition-all hover:-translate-y-4 cursor-pointer relative overflow-hidden active:scale-95 duration-500">
                             <div className="absolute -right-8 -bottom-8 text-black/5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                                {getIcon(sport.iconName, 200)}
                            </div>
                            <div className="relative z-10 flex justify-between items-start mb-10">
                                <div className="p-6 rounded-[1.8rem] bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    {getIcon(sport.iconName, 32)}
                                </div>
                                {isFinished && <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg ring-4 ring-white"><Check size={24} strokeWidth={4} /></div>}
                            </div>
                            <h3 className="text-3xl font-black text-gray-800 italic leading-tight mb-2 tracking-tighter">{sport.name}</h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sport.category}</span>
                            
                            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                                 {isFinished && champion ? (
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md ${champion.tailwindBg}`}>{champion.name.substring(0,1)}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Champion</span>
                                            <span className="font-black text-gray-800 text-base">{champion.name.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                                        <span className="text-[11px] font-black text-gray-300 italic tracking-widest uppercase">Waiting Results</span>
                                    </div>
                                 )}
                                 <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={24} />
                                 </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-800 relative flex flex-col">
      <div style={{ display: isPrintingBrackets ? 'block' : 'none' }}>
        <AllMatchesPrintView tournaments={tournaments} sportsList={SPORTS_LIST} />
      </div>
      <div style={{ display: isPrintingResults ? 'block' : 'none' }}>
        <AllResultsPrintView tournaments={tournaments} sportsList={SPORTS_LIST} />
      </div>

      <GlobalHeader />

      <main className="flex-grow flex flex-col">
        {isLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center p-20">
                <div className="relative mb-12">
                    <div className="w-32 h-32 border-[14px] border-white/50 rounded-full animate-spin border-t-blue-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy size={48} className="text-blue-500" />
                    </div>
                </div>
                <span className="font-black text-gray-400 italic text-2xl animate-pulse tracking-[0.3em]">กำลังโหลดข้อมูลสนาม...</span>
            </div>
        ) : selectedSportId ? (
            <div className="pt-12 px-6 animate-slide-up max-w-7xl mx-auto pb-32 flex-grow w-full">
                <button onClick={() => setSelectedSportId(null)} className="flex items-center gap-5 text-gray-800 font-black bg-white px-10 py-5 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all mb-16 no-print border-4 border-white active:scale-95 group">
                    <ChevronLeft size={32} className="text-blue-500 group-hover:-translate-x-2 transition-transform" />
                    <span className="text-xl">กลับหน้าหลัก</span>
                </button>
                {tournaments[selectedSportId] && (
                    tournaments[selectedSportId].sportConfig.type === 'athletics' ? (
                        <AthleticsResultView tournament={tournaments[selectedSportId]} onUpdateWinners={handleAthleticsUpdate} />
                    ) : (
                        <BracketView tournament={tournaments[selectedSportId]} onUpdateMatch={handleMatchUpdate} />
                    )
                )}
            </div>
        ) : (
            <div className="flex-grow w-full">
                {activeTab === 'home' && <HomeView />}
                {activeTab === 'sports' && <SportSelectionView />}
                {activeTab === 'results' && <div className="max-w-7xl mx-auto px-6 py-16 pb-32"><SportWinnersGrid tournaments={tournaments} /></div>}
                {activeTab === 'ranking' && (
                    <div className="max-w-7xl mx-auto px-6 py-16 animate-fade-in no-print pb-[180px]">
                        <div className="text-center mb-24">
                            <h2 className="text-6xl md:text-9xl font-black text-gray-900 tracking-tighter italic leading-none mb-6 uppercase">Rankings</h2>
                            <p className="text-gray-400 font-black text-sm uppercase tracking-[0.8em]">Soft Pastel • Professional Records</p>
                        </div>
                        <div className="mb-24 scale-110 md:scale-125 origin-center">
                            <OverallPodium standings={overallStandings as any} />
                        </div>
                        <div className="space-y-32">
                            <div className="flex items-center gap-8">
                                <div className="h-16 w-3.5 bg-blue-600 rounded-full shadow-lg shadow-blue-100"></div>
                                <div>
                                    <h3 className="text-5xl font-black text-gray-800 italic tracking-tighter uppercase leading-none">คะแนนรวมสะสม</h3>
                                    <p className="text-gray-400 font-bold text-lg mt-2">สถิติเหรียญรางวัลและคะแนนจากกีฬาทุกประเภท</p>
                                </div>
                            </div>
                            <MedalTable standings={overallStandings as any} />
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-3xl px-10 py-5 rounded-[3.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.2)] border-4 border-white/60 flex items-center gap-4 z-[150] no-print">
          {[
              { id: 'home', icon: <Home size={28} />, label: 'HOME' },
              { id: 'sports', icon: <Target size={28} />, label: 'ARENA' },
              { id: 'results', icon: <ClipboardList size={28} />, label: 'LOGS' },
              { id: 'ranking', icon: <Medal size={28} />, label: 'RANK' }
          ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSelectedSportId(null); }} className={`flex items-center gap-4 px-10 py-4 rounded-full font-black text-xs transition-all duration-700 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl scale-110' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
                  {tab.icon}
                  {activeTab === tab.id && <span className="tracking-[0.3em] italic">{tab.label}</span>}
              </button>
          ))}
      </nav>

      <footer className="w-full py-24 text-center no-print">
          <div className="max-w-xl mx-auto px-8">
              <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-16 opacity-30"></div>
              <p className="text-gray-400 font-black text-xs italic tracking-[0.6em] uppercase leading-loose">
                  พัฒนาและออกแบบโดย Krukai &copy; ๒๕๖๘<br/>
                  Municipal School 1 Wat Phrom Vihan
              </p>
          </div>
      </footer>

      {showResetModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-[3.5rem] shadow-3xl max-w-md w-full p-12 border-4 border-white relative overflow-hidden text-center">
                  <div className="bg-rose-50 text-rose-500 p-8 rounded-[2.5rem] mb-8 inline-block shadow-sm">
                      <ShieldAlert size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 italic">ล้างข้อมูลทั้งหมด?</h3>
                  <p className="text-gray-400 font-bold text-sm mb-10 leading-relaxed px-4">คะแนนและผลการแข่งขันจะถูกรีเซ็ต ไม่สามารถกู้คืนได้</p>
                  <div className={`w-full relative mb-10 ${resetError ? 'animate-shake' : ''}`}>
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"><Key size={24} /></div>
                      <input type="password" value={resetPasscode} onChange={(e) => { setResetPasscode(e.target.value); setResetError(false); }} placeholder="ยืนยันรหัสผ่าน" className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-gray-100 rounded-[2rem] font-black text-2xl focus:outline-none focus:border-blue-500 transition-all text-center" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                      <button onClick={() => { setShowResetModal(false); setResetPasscode(''); }} className="py-5 rounded-[2rem] font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">ยกเลิก</button>
                      <button onClick={handleResetAllData} className="py-5 rounded-[2rem] font-black text-white bg-rose-500 hover:bg-rose-600 shadow-xl transition-all">ยืนยัน</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
