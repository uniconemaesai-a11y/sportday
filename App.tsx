import React, { useState, useEffect, useMemo } from 'react';
import { SPORTS_LIST, getIcon, toThaiNumber, TEAMS } from './constants';
import { SportTournament, Match, SportConfig } from './types';
import { initializeTournament, updateTournamentMatch, saveToLocal, loadFromLocal, fetchFromSheets, mergeSheetData, saveToCloud } from './services/tournamentService';
import BracketView from './components/BracketView';
import MedalTable from './components/MedalTable';
import BroadcastCard from './components/BroadcastCard';
import MatchResultCard from './components/MatchResultCard';
import OverallPodium from './components/OverallPodium';
import AllMatchesPrintView from './components/AllMatchesPrintView';
import { Home, Trophy, Medal, ChevronLeft, RefreshCw, Database, Check, ListFilter, Printer, FileText, X, ChevronRight, Heart, Sparkles, Activity, Star, Zap, Loader2, Search, Filter, Layers, Target, Dumbbell, Users, User, LayoutGrid, Trash2, AlertTriangle, TrendingUp, Award, ListChecks, TableProperties } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'sports' | 'ranking'>('home');
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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
                const allMatches = Object.values(initialData).flatMap(t => t.matches);
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
      setIsSyncing(true);
      const initialData: Record<string, SportTournament> = {};
      SPORTS_LIST.forEach(sport => {
          initialData[sport.id] = initializeTournament(sport);
      });
      
      setTournaments(initialData);
      saveToLocal(initialData);
      
      const allMatches = Object.values(initialData).flatMap(t => t.matches);
      await saveToCloud(allMatches);
      
      setIsSyncing(false);
      setShowResetModal(false);
      setActiveTab('home');
      setSelectedSportId(null);
  };

  const handlePrintMasterReport = () => {
      setIsPrinting(true);
      const element = document.getElementById('master-print-container');
      if (element && (window as any).html2pdf) {
          const originalStyle = element.getAttribute('style') || '';
          element.style.display = 'block';
          element.style.position = 'fixed';
          element.style.top = '0';
          element.style.left = '0';
          element.style.zIndex = '9999';
          element.style.backgroundColor = 'white';
          element.style.width = '1123px';

          const opt = {
            margin: 10,
            filename: `สรุปผลการแข่งขันรวม_กีฬาสีสัมพันธ์_๒๕๖๘.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff', logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          };

          setTimeout(() => {
              (window as any).html2pdf().set(opt).from(element).save().then(() => {
                  element.setAttribute('style', originalStyle);
                  setIsPrinting(false);
                  setShowPrintModal(false);
              }).catch((err: any) => {
                  console.error(err);
                  element.setAttribute('style', originalStyle);
                  setIsPrinting(false);
                  alert("เกิดข้อผิดพลาดในการสร้าง PDF");
              });
          }, 1500);
      }
  };

  const handleDirectPrintAllResults = () => {
      window.print();
  };

  const standingsData = useMemo(() => {
    const stats: Record<string, { team: typeof TEAMS[0], gold: number, silver: number, bronze: number, points: number, total: number }> = {};
    TEAMS.forEach(team => {
        stats[team.id] = { team, gold: 0, silver: 0, bronze: 0, points: 0, total: 0 };
    });

    Object.values(tournaments).forEach(t => {
        if (t.championId && stats[t.championId]) { 
            stats[t.championId].gold++; 
            stats[t.championId].points += 3;
            stats[t.championId].total++;
        }
        if (t.runnerUpId && stats[t.runnerUpId]) { 
            stats[t.runnerUpId].silver++; 
            stats[t.runnerUpId].points += 2;
            stats[t.runnerUpId].total++;
        }
        if (t.secondRunnerUpId && stats[t.secondRunnerUpId]) { 
            stats[t.secondRunnerUpId].bronze++; 
            stats[t.secondRunnerUpId].points += 1;
            stats[t.secondRunnerUpId].total++;
        }
    });

    return Object.values(stats).sort((a, b) => b.points - a.points || b.gold - a.gold);
  }, [tournaments]);

  const finishedSportsBreakdown = useMemo(() => {
    return Object.values(tournaments)
      .filter(t => t.championId)
      .sort((a, b) => a.sportConfig.name.localeCompare(b.sportConfig.name));
  }, [tournaments]);

  const filteredSports = useMemo(() => {
    return SPORTS_LIST.filter(sport => {
        const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             sport.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ทั้งหมด' || 
                                (selectedCategory === 'ลูกบอล' && (sport.type === 'football' || sport.type === 'futsal' || sport.type === 'volleyball' || sport.type === 'handball' || sport.type === 'chairball')) ||
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
                    <h1 className="text-white font-black text-4xl md:text-7xl drop-shadow-2xl tracking-tight italic leading-none">กีฬาสีสัมพันธ์ ๒๕๖๘</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="bg-yellow-400 p-1.5 rounded-full shadow-lg"><Sparkles className="text-white animate-pulse" size={18} /></div>
                        <div className="bg-black/20 backdrop-blur-md px-6 py-1.5 rounded-full border-2 border-white/20">
                            <h2 className="text-white font-black text-base md:text-xl tracking-wide uppercase">โรงเรียนเทศบาล ๑ วัดพรหมวิหาร</h2>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 no-print">
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
                            <span>พิมพ์ผลทุกกีฬา</span>
                        </button>

                        <button 
                            onClick={handleDirectPrintAllResults}
                            className="flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl bg-indigo-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                        >
                            <TableProperties size={16} />
                            <span>พิมพ์ตารางสายแข่ง</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowPrintModal(true)} 
                            className="flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl bg-white text-indigo-600 border-2 border-indigo-50 shadow-sm hover:shadow-md hover:bg-indigo-50/50 transition-all active:scale-95"
                        >
                            <FileText size={16} />
                            <span>ออกรายงาน PDF</span>
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
                            className="flex items-center gap-2 text-[11px] font-black px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 border-2 border-rose-100 hover:bg-rose-100 transition-all active:scale-95"
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
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mt-1">ทอง 3 • เงิน 2 • ทองแดง 1</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black">
                        <TrendingUp size={16} /> LIVE RANKING
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {standingsData.map((row, idx) => (
                        <div key={row.team.id} className={`group relative overflow-hidden p-8 rounded-[3rem] shadow-xl border-4 transition-all duration-500 hover:-translate-y-2 bg-white ${row.team.tailwindBorder} border-opacity-20`}>
                            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-orange-400' : 'bg-gray-100 text-gray-400'}`}>
                                {idx + 1}
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white font-black text-xs md:text-sm shadow-2xl mb-4 ${row.team.tailwindBg} ring-8 ring-white transform group-hover:scale-110 transition-transform px-1 text-center leading-tight`}>
                                    {row.team.name.split(' ')[0]}
                                </div>
                                <h4 className="text-2xl font-black text-gray-800 mb-1 leading-none">{row.team.name.split(' ')[0]}</h4>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">{row.team.name.split('(')[1]?.replace(')', '') || 'โรงเรียนเทศบาล ๑'}</div>
                                
                                <div className="w-full bg-gray-50 rounded-2xl p-4 flex flex-col items-center border border-gray-100 shadow-inner">
                                    <span className="text-4xl font-black text-indigo-600 drop-shadow-sm">{row.points}</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">คะแนนรวม</span>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-lg bg-yellow-400 text-white flex items-center justify-center shadow-md mb-1"><Medal size={14} fill="currentColor" /></div>
                                        <span className="text-xs font-black">{row.gold}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-lg bg-slate-300 text-white flex items-center justify-center shadow-md mb-1"><Medal size={14} fill="currentColor" /></div>
                                        <span className="text-xs font-black">{row.silver}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-lg bg-orange-400 text-white flex items-center justify-center shadow-md mb-1"><Medal size={14} fill="currentColor" /></div>
                                        <span className="text-xs font-black">{row.bronze}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {finishedSportsBreakdown.length > 0 && (
                <div className="mt-20">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-sm"><ListChecks size={28} /></div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-800 tracking-tighter italic leading-none">สรุปคะแนนแต่ละชนิดกีฬา</h3>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mt-1">Finished Sports breakdown</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {finishedSportsBreakdown.map((t, idx) => {
                            const gold = TEAMS.find(team => team.id === t.championId);
                            const silver = TEAMS.find(team => team.id === t.runnerUpId);
                            const bronze = TEAMS.find(team => team.id === t.secondRunnerUpId);

                            return (
                                <div key={t.sportConfig.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-gray-50 hover:border-indigo-100 transition-all group overflow-hidden relative">
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-125 transition-transform">
                                        {getIcon(t.sportConfig.iconName, 120)}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            {getIcon(t.sportConfig.iconName, 24)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">{t.sportConfig.name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{t.sportConfig.category}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {gold && (
                                            <div className="flex items-center justify-between bg-yellow-50/50 p-3 rounded-2xl border border-yellow-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[8px] ${gold.tailwindBg}`}>๑</div>
                                                    <span className="text-xs font-black text-gray-700">{gold.name.split(' ')[0]}</span>
                                                </div>
                                                <span className="bg-yellow-400 text-white text-[10px] font-black px-3 py-1 rounded-full">+๓ คะแนน</span>
                                            </div>
                                        )}
                                        {silver && (
                                            <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[8px] ${silver.tailwindBg}`}>๒</div>
                                                    <span className="text-xs font-black text-gray-700">{silver.name.split(' ')[0]}</span>
                                                </div>
                                                <span className="bg-slate-400 text-white text-[10px] font-black px-3 py-1 rounded-full">+๒ คะแนน</span>
                                            </div>
                                        )}
                                        {bronze && (
                                            <div className="flex items-center justify-between bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[8px] ${bronze.tailwindBg}`}>๓</div>
                                                    <span className="text-xs font-black text-gray-700">{bronze.name.split(' ')[0]}</span>
                                                </div>
                                                <span className="bg-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full">+๑ คะแนน</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-20 group">
                <div className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 rounded-[4rem] p-1.5 shadow-[0_35px_80px_-15px_rgba(30,58,138,0.4)] overflow-hidden">
                    <div className="bg-white/5 backdrop-blur-md rounded-[3.8rem] p-10 md:p-14 text-white relative flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-30"></div>
                        
                        <div className="text-center md:text-left relative z-10">
                            <h3 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-blue-400 italic">Arena Entrance</h3>
                            <p className="text-blue-100/70 font-bold text-lg md:text-xl max-w-sm">เข้าสู่สนามแข่งขัน เพื่อบันทึกผลการแข่งขันและตรวจสอบตารางสายกีฬา</p>
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
                        placeholder="ค้นหา..." 
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

        <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 pb-[180px]">
            {filteredSports.length > 0 ? filteredSports.map((sport, index) => {
                const tournament = tournaments[sport.id];
                const isFinished = tournament?.championId;
                const champion = TEAMS.find(t => t.id === tournament?.championId);

                const getPastelStyle = (type: string) => {
                  switch(type) {
                    case 'football': case 'futsal': 
                      return { grad: 'from-emerald-50 to-emerald-100', iconBg: 'bg-emerald-500', text: 'text-emerald-900', accent: 'border-emerald-200' };
                    case 'volleyball': case 'chairball': case 'handball': 
                      return { grad: 'from-orange-50 to-orange-100', iconBg: 'bg-orange-500', text: 'text-orange-900', accent: 'border-orange-200' };
                    case 'badminton': case 'petanque': 
                      return { grad: 'from-indigo-50 to-indigo-100', iconBg: 'bg-indigo-500', text: 'text-indigo-900', accent: 'border-indigo-200' };
                    case 'tugofwar': 
                      return { grad: 'from-rose-50 to-rose-100', iconBg: 'bg-rose-500', text: 'text-rose-900', accent: 'border-rose-200' };
                    default: 
                      return { grad: 'from-blue-50 to-blue-100', iconBg: 'bg-blue-600', text: 'text-blue-900', accent: 'border-blue-200' };
                  }
                }

                const style = getPastelStyle(sport.type);

                return (
                    <div 
                        key={sport.id} 
                        onClick={() => setSelectedSportId(sport.id)} 
                        className={`group relative overflow-hidden p-10 rounded-[4rem] transition-all cursor-pointer bg-gradient-to-br ${style.grad} border-4 ${isFinished ? 'border-green-300 shadow-2xl shadow-green-900/10' : 'border-white shadow-xl shadow-gray-900/5'} hover:shadow-3xl hover:-translate-y-4 hover:rotate-1 animate-slide-up`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="absolute -right-8 -bottom-8 text-black/5 pointer-events-none group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                            {getIcon(sport.iconName, 300)}
                        </div>

                        <div className="relative z-10 flex justify-between items-start mb-12">
                            <div className={`p-6 rounded-[2.2rem] transition-all shadow-2xl text-white ${style.iconBg} group-hover:scale-110 group-hover:rotate-6`}>
                                {getIcon(sport.iconName, 44)}
                            </div>
                            {isFinished ? (
                                <div className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-full text-[10px] font-black shadow-lg border-2 border-white">
                                    <Check size={16} strokeWidth={4} /> จบการแข่งขัน
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md text-blue-600 px-6 py-2 rounded-full text-[10px] font-black shadow-sm ring-4 ring-white/50">
                                    <Activity size={16} className="animate-pulse" /> กำลังแข่งขัน
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 mb-8">
                            <h3 className={`text-3xl md:text-4xl font-black ${style.text} mb-3 tracking-tighter italic leading-tight`}>{sport.name}</h3>
                            <div className="flex items-center gap-3 text-sm font-black text-black/40 uppercase tracking-[0.2em]">
                                <Target size={18} /> {sport.category}
                            </div>
                        </div>

                        {isFinished && champion ? (
                            <div className="relative z-10 mt-10 pt-10 border-t-4 border-dashed border-black/5 flex items-center justify-between group/footer">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white font-black text-xs shadow-2xl ${champion.tailwindBg} ring-4 ring-white transform group-hover/footer:rotate-12 transition-transform px-1 text-center leading-tight`}>
                                        {champion.name.split(' ')[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic leading-none mb-1">Champion ๒๕๖๘</span>
                                        <span className="text-2xl font-black text-gray-900 leading-none">{champion.name.split(' ')[0]}</span>
                                    </div>
                                </div>
                                <div className="bg-yellow-400 p-4 rounded-full text-white shadow-xl shadow-yellow-200 transform group-hover/footer:-translate-y-2 transition-transform">
                                    <Trophy size={32} fill="currentColor" />
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 mt-10 pt-10 border-t-2 border-black/5 flex items-center justify-between">
                                <span className="text-xs font-black text-black/30 italic">คลิกเพื่อเข้าสู่แผงควบคุมสนาม</span>
                                <div className="bg-white/80 p-3 rounded-2xl text-blue-600 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <ChevronRight size={24} strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-gray-300">
                    <div className="bg-white p-20 rounded-[5rem] shadow-2xl border-4 border-gray-50 mb-10 transform hover:rotate-6 transition-transform">
                        <Search size={120} className="text-gray-100" />
                    </div>
                    <p className="text-4xl font-black text-gray-300 tracking-tight italic">ไม่พบการแข่งขันในสนามนี้...</p>
                    <button onClick={() => {setSearchQuery(''); setSelectedCategory('ทั้งหมด');}} className="mt-10 text-blue-600 font-black text-2xl underline hover:text-blue-800 transition-colors">ล้างการค้นหา</button>
                </div>
            )}
        </div>
    </div>
  );

  const RankingView = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in no-print pb-[180px]">
            <div className="text-center mb-16">
                <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter italic leading-none mb-4">สรุปตารางเหรียญ</h2>
                <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em]">Official Medal Standings • 2568</p>
            </div>

            <div className="mb-20">
                <OverallPodium standings={standingsData} />
            </div>

            <div className="mb-20">
                <MedalTable standings={standingsData} />
            </div>

            {Object.values(tournaments).filter(t => t.championId).length > 0 && (
                <div className="mt-24">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-10 w-2 bg-pink-500 rounded-full"></div>
                        <h3 className="text-3xl font-black text-gray-800 italic">ผลการแข่งขันล่าสุด</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.values(tournaments)
                            .filter(t => t.championId)
                            .sort((a, b) => 0.5 - Math.random())
                            .map((t, idx) => (
                            <BroadcastCard 
                                key={t.sportConfig.id}
                                sportName={t.sportConfig.name}
                                category={t.sportConfig.category}
                                championId={t.championId}
                                runnerUpId={t.runnerUpId}
                                secondRunnerUpId={t.secondRunnerUpId}
                                delay={idx * 100}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-800 relative bg-[#fdfcfb] flex flex-col">
      {/* Hidden Master Print View */}
      <div id="master-print-container" style={{ display: 'none' }}>
        <AllMatchesPrintView tournaments={tournaments} sportsList={SPORTS_LIST} />
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 no-print">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isSyncing && setShowResetModal(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-slide-up border-4 border-white">
                <div className="bg-rose-500 p-10 text-white flex flex-col items-center">
                    <div className="bg-white/20 p-6 rounded-full mb-6 ring-4 ring-white/10">
                        {isSyncing ? <Loader2 size={64} className="animate-spin" /> : <AlertTriangle size={64} />}
                    </div>
                    <h3 className="text-3xl font-black mb-2 italic">{isSyncing ? 'กำลังเตรียมข้อมูลใหม่...' : 'ล้างข้อมูลทั้งหมด?'}</h3>
                    <p className="text-rose-100 text-center text-sm font-medium leading-relaxed px-4">
                        {isSyncing ? 'กรุณารอสักครู่ ระบบกำลังสื่อสารกับ Cloud Server' : 'ระวัง! การกระทำนี้จะล้างคะแนนและสายการแข่งขันทุกรายการเป็นค่าเริ่มต้น และซิงค์ข้อมูลใหม่ลง Cloud ทันที ข้อมูลเดิมจะสูญหายทั้งหมด'}
                    </p>
                </div>
                <div className="p-8 flex gap-4">
                    {!isSyncing && (
                        <>
                            <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 font-black hover:bg-gray-200 transition-colors">ยกเลิก</button>
                            <button onClick={handleResetAllData} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                                <Trash2 size={18} />
                                <span>ยืนยันการล้าง</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => !isPrinting && setShowPrintModal(false)}></div>
            <div className="bg-white w-full max-lg rounded-[4.5rem] shadow-2xl relative z-10 overflow-hidden animate-slide-up border-4 border-white">
                <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-950 p-12 text-white flex flex-col items-center">
                    <div className="bg-white/10 p-8 rounded-[3rem] mb-8 shadow-inner ring-4 ring-white/5">{isPrinting ? <Loader2 size={64} className="animate-spin" /> : <Printer size={64} />}</div>
                    <h3 className="text-5xl font-black mb-3 tracking-tight italic">พิมพ์รายงานรวม</h3>
                    <p className="text-blue-200 font-black opacity-60 uppercase tracking-[0.3em] text-xs italic">Academic Record ๒๕๖๘</p>
                    {!isPrinting && <button onClick={() => setShowPrintModal(true)} className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"><X size={40} /></button>}
                </div>
                <div className="p-12">
                    <button onClick={handlePrintMasterReport} disabled={isPrinting} className="w-full flex items-center justify-between bg-blue-600 text-white p-10 rounded-[3rem] shadow-[0_25px_50px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group">
                        <div className="flex items-center gap-8">
                            <div className="bg-white/20 p-5 rounded-2xl group-hover:rotate-12 transition-transform"><FileText size={48} /></div>
                            <div className="text-left">
                                <div className="font-black text-3xl leading-none mb-2">ดาวน์โหลด PDF</div>
                                <div className="text-sm font-black text-blue-100 opacity-80 italic uppercase tracking-wider">Full Master Report</div>
                            </div>
                        </div>
                        <ChevronRight size={40} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow">
        {isLoading ? (
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 size={64} className="animate-spin text-blue-500 mb-4" />
                <span className="font-black text-gray-400 italic">กำลังโหลดข้อมูลสนาม...</span>
            </div>
        ) : selectedSportId ? (
            <div className="pt-10 px-6 animate-slide-up max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-center mb-12 no-print">
                    <button onClick={() => setSelectedSportId(null)} className="flex items-center gap-4 text-gray-800 font-black bg-white px-10 py-5 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 border-4 border-gray-50"><ChevronLeft size={28} className="text-blue-600" /><span>ย้อนกลับไปสนาม</span></button>
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="h-12 w-2 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                        <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Management Center</span><span className="text-lg font-black text-gray-900 leading-none">แผงจัดการคะแนนสายแข่ง</span></div>
                    </div>
                </div>
                {tournaments[selectedSportId] && <BracketView tournament={tournaments[selectedSportId]} onUpdateMatch={handleMatchUpdate} />}
            </div>
        ) : (
            <>
                {activeTab === 'home' && <HomeView />}
                {activeTab === 'sports' && <SportSelectionView />}
                {activeTab === 'ranking' && <RankingView />}
            </>
        )}
      </main>

      {/* Footer with Subtle Copyright */}
      <footer className="w-full py-10 text-center no-print pb-[120px]">
          <p className="text-gray-400/60 text-[10px] font-black uppercase tracking-[0.2em] italic">พัฒนาและออกแบบโดย Krukai &copy; 2025</p>
      </footer>

      {/* NEW Ergonomic Thumb-Curve Navigation Bar (80px) with Vibrant Pastel Colors */}
      <nav className="fixed bottom-0 left-0 right-0 w-full h-[80px] z-[90] print:hidden no-print">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Smooth Thumb Curve Path */}
            <svg viewBox="0 0 400 80" className="w-full h-full filter drop-shadow-[0_-15px_30px_rgba(0,0,0,0.1)]" preserveAspectRatio="none">
                <path 
                  d="M0,80 L400,80 L400,20 Q200,-15 0,20 Z" 
                  fill="rgba(255,255,255,0.98)" 
                  className="backdrop-blur-xl"
                />
            </svg>
        </div>
        
        <div className="relative h-full flex items-center justify-around px-8 max-w-2xl mx-auto">
            {/* Home Tab - Pastel Blue */}
            <button 
                onClick={() => { setActiveTab('home'); setSelectedSportId(null); setSearchQuery(''); }} 
                className="flex flex-col items-center justify-center w-20 relative transition-all duration-500"
            >
                <div className={`p-4 rounded-3xl transition-all duration-500 ${activeTab === 'home' ? 'bg-blue-400 text-white -translate-y-8 scale-110 shadow-[0_15px_30px_rgba(147,197,253,0.6)] ring-8 ring-white' : 'text-gray-300'}`}>
                    <Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                </div>
                <span className={`absolute bottom-2 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'home' ? 'text-blue-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Home</span>
            </button>

            {/* Sports Tab - Pastel Orange */}
            <button 
                onClick={() => { setActiveTab('sports'); setSelectedSportId(null); }} 
                className="flex flex-col items-center justify-center w-20 relative transition-all duration-500"
            >
                <div className={`p-4 rounded-3xl transition-all duration-500 ${activeTab === 'sports' ? 'bg-orange-300 text-white -translate-y-8 scale-110 shadow-[0_15px_30px_rgba(253,186,116,0.6)] ring-8 ring-white' : 'text-gray-300'}`}>
                    <Trophy size={28} strokeWidth={activeTab === 'sports' ? 2.5 : 2} />
                </div>
                <span className={`absolute bottom-2 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'sports' ? 'text-orange-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Arena</span>
            </button>

            {/* Ranking Tab - Pastel Pink */}
            <button 
                onClick={() => { setActiveTab('ranking'); setSelectedSportId(null); setSearchQuery(''); }} 
                className="flex flex-col items-center justify-center w-20 relative transition-all duration-500"
            >
                <div className={`p-4 rounded-3xl transition-all duration-500 ${activeTab === 'ranking' ? 'bg-pink-300 text-white -translate-y-8 scale-110 shadow-[0_15px_30px_rgba(249,168,212,0.6)] ring-8 ring-white' : 'text-gray-300'}`}>
                    <Medal size={28} strokeWidth={activeTab === 'ranking' ? 2.5 : 2} />
                </div>
                <span className={`absolute bottom-2 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'ranking' ? 'text-pink-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Ranking</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
