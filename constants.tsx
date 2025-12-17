import React from 'react';
import { Team, SportConfig } from './types';
import { Trophy, Medal, Flag, Users, User, Dna, Activity, Hexagon, Circle, Square } from 'lucide-react';

export const TEAMS: Team[] = [
  { 
    id: 't1', 
    name: 'สีแดง (แรงฤทธิ์)', 
    color: 'red', 
    colorHex: '#ef4444',
    tailwindBg: 'bg-red-500', 
    tailwindText: 'text-red-700',
    tailwindBorder: 'border-red-500',
    score: 0 
  },
  { 
    id: 't2', 
    name: 'สีเขียว (เหนี่ยวทรัพย์)', 
    color: 'green', 
    colorHex: '#22c55e',
    tailwindBg: 'bg-green-500', 
    tailwindText: 'text-green-700',
    tailwindBorder: 'border-green-500',
    score: 0 
  },
  { 
    id: 't3', 
    name: 'สีชมพู (ชูใจ)', 
    color: 'pink', 
    colorHex: '#ec4899',
    tailwindBg: 'bg-pink-400', 
    tailwindText: 'text-pink-600',
    tailwindBorder: 'border-pink-400',
    score: 0 
  },
  { 
    id: 't4', 
    name: 'สีม่วง (ช่วงโชติ)', 
    color: 'purple', 
    colorHex: '#a855f7',
    tailwindBg: 'bg-purple-500', 
    tailwindText: 'text-purple-700',
    tailwindBorder: 'border-purple-500',
    score: 0 
  },
];

const createSport = (id: string, name: string, category: string, icon: string, type: any): SportConfig => ({
  id,
  name,
  category,
  iconName: icon,
  type
});

export const SPORTS_LIST: SportConfig[] = [
  createSport('s1', 'ฟุตบอล', 'รุ่น 10 ปี ชาย', 'Activity', 'football'),
  createSport('s2', 'ฟุตบอล', 'รุ่น 12 ปี ชาย', 'Activity', 'football'),
  createSport('s3', 'แฮนด์บอล', 'รุ่น 12 ปี ชาย', 'Circle', 'handball'),
  createSport('s4', 'แฮนด์บอล', 'รุ่น 12 ปี หญิง', 'Circle', 'handball'),
  createSport('s5', 'แชร์บอล', 'รุ่น 8 ปี ชาย', 'Hexagon', 'chairball'),
  createSport('s6', 'แชร์บอล', 'รุ่น 8 ปี หญิง', 'Hexagon', 'chairball'),
  createSport('s7', 'แชร์บอล', 'รุ่น 10 ปี ชาย', 'Hexagon', 'chairball'),
  createSport('s8', 'แชร์บอล', 'รุ่น 10 ปี หญิง', 'Hexagon', 'chairball'),
  createSport('s9', 'วอลเลย์บอล', 'รุ่น 12 ปี ชาย', 'Activity', 'volleyball'),
  createSport('s10', 'วอลเลย์บอล', 'รุ่น 12 ปี หญิง', 'Activity', 'volleyball'),
  createSport('s11', 'ฟุตซอล', 'รุ่น 12 ปี ชาย', 'Activity', 'futsal'),
  createSport('s12', 'ฟุตซอล', 'รุ่น 12 ปี หญิง', 'Activity', 'futsal'),
  createSport('s13', 'ชักเย่อ', 'รุ่น 12 ปี ชาย', 'Users', 'tugofwar'),
  createSport('s14', 'ชักเย่อ', 'รุ่น 12 ปี หญิง', 'Users', 'tugofwar'),
  createSport('s15', 'ชักกะเย่อสากล', 'ทีมชาย 8 คน', 'Users', 'tugofwar'),
  createSport('s16', 'ชักกะเย่อสากล', 'ทีมหญิง 8 คน', 'Users', 'tugofwar'),
  createSport('s17', 'เปตอง', 'ทีมชาย', 'Circle', 'petanque'),
  createSport('s18', 'เปตอง', 'ทีมหญิง', 'Circle', 'petanque'),
  createSport('s19', 'แบดมินตัน', 'ชายเดี่ยว', 'Dna', 'badminton'),
  createSport('s20', 'แบดมินตัน', 'หญิงเดี่ยว', 'Dna', 'badminton'),
  createSport('s21', 'แบดมินตัน', 'ชายคู่', 'Users', 'badminton'),
  createSport('s22', 'แบดมินตัน', 'หญิงคู่', 'Users', 'badminton'),
  createSport('s23', 'หมากรุก', 'บุคคลชาย', 'Square', 'chess'),
  createSport('s24', 'หมากรุก', 'บุคคลหญิง', 'Square', 'chess'),
  createSport('s25', 'หมากฮอส', 'บุคคลชาย', 'Square', 'checkers'),
  createSport('s26', 'หมากฮอส', 'บุคคลหญิง', 'Square', 'checkers'),
];

export const THAI_NUMERALS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];

export const toThaiNumber = (num: number): string => {
  return num.toString().split('').map(char => {
    const n = parseInt(char);
    return isNaN(n) ? char : THAI_NUMERALS[n];
  }).join('');
};

export const getIcon = (name: string, size: number = 24, className: string = '') => {
  const props = { size, className };
  switch (name) {
    case 'Activity': return <Activity {...props} />;
    case 'Circle': return <Circle {...props} />;
    case 'Hexagon': return <Hexagon {...props} />;
    case 'Square': return <Square {...props} />;
    case 'Users': return <Users {...props} />;
    case 'User': return <User {...props} />;
    case 'Dna': return <Dna {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    case 'Medal': return <Medal {...props} />;
    case 'Flag': return <Flag {...props} />;
    default: return <Activity {...props} />;
  }
};