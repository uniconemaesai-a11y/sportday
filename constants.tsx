
import React from 'react';
import { Team, SportConfig } from './types';
import { Trophy, Medal, Flag, Users, User, Dna, Activity, Hexagon, Circle, Square, Timer, Footprints, Baby, Bike } from 'lucide-react';

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
  // --- กรีฑาและกีฬาเด็กเล็ก (Athletics) ---
  createSport('a1', 'วิ่ง 20 เมตร', 'เตรียมอนุบาล', 'Timer', 'athletics'),
  createSport('a2', 'ตักปิงปองใส่ตะกร้า', 'เตรียมอนุบาล', 'Circle', 'athletics'),
  createSport('a3', 'กระโดดข้ามห่วง/ลอดสิ่งกีดขวาง', 'เตรียมอนุบาล', 'Activity', 'athletics'),
  createSport('a4', 'แต่งตัวให้ลูก', 'เตรียมอนุบาล', 'User', 'athletics'),
  createSport('a5', 'จักรยานขาไถ', '2-3 ขวบ', 'Bike', 'athletics'),
  createSport('a6', 'วิ่งระยะ 30 ม.', 'อนุบาล 1', 'Timer', 'athletics'),
  createSport('a7', 'วิ่งระยะ 40 ม.', 'อนุบาล 2', 'Timer', 'athletics'),
  createSport('a8', 'วิ่งระยะ 50 ม.', 'อนุบาล 3', 'Timer', 'athletics'),
  createSport('a9', 'วิ่งผลัด 4x25 ม.', 'อนุบาล 1-3', 'Users', 'athletics'),
  createSport('a10', 'เดินตัวหนอน', 'อนุบาล', 'Footprints', 'athletics'),
  createSport('a11', 'โยนบอลใส่ตะกร้า', 'อนุบาล', 'Circle', 'athletics'),
  createSport('a12', 'จักรยานขาไถ', 'อนุบาล 1', 'Bike', 'athletics'),
  createSport('a13', 'จักรยานขาไถ', 'อนุบาล 2', 'Bike', 'athletics'),
  createSport('a14', 'จักรยานขาไถ', 'อนุบาล 3', 'Bike', 'athletics'),
  createSport('a15', 'วิ่งระยะ 60 ม.', 'ชาย 8 ปี', 'Timer', 'athletics'),
  createSport('a16', 'วิ่งระยะ 60 ม.', 'หญิง 8 ปี', 'Timer', 'athletics'),
  createSport('a17', 'วิ่งระยะ 60 ม.', 'ชาย 10 ปี', 'Timer', 'athletics'),
  createSport('a18', 'วิ่งระยะ 60 ม.', 'หญิง 10 ปี', 'Timer', 'athletics'),
  createSport('a19', 'วิ่งระยะ 80 ม.', 'ชาย 8 ปี', 'Timer', 'athletics'),
  createSport('a20', 'วิ่งระยะ 80 ม.', 'หญิง 8 ปี', 'Timer', 'athletics'),
  createSport('a21', 'วิ่งระยะ 80 ม.', 'ชาย 10 ปี', 'Timer', 'athletics'),
  createSport('a22', 'วิ่งระยะ 80 ม.', 'หญิง 10 ปี', 'Timer', 'athletics'),
  createSport('a23', 'วิ่งระยะ 100 ม.', 'ชาย 10 ปี', 'Timer', 'athletics'),
  createSport('a24', 'วิ่งระยะ 100 ม.', 'หญิง 10 ปี', 'Timer', 'athletics'),
  createSport('a25', 'วิ่งระยะ 100 ม.', 'ชาย 12 ปี', 'Timer', 'athletics'),
  createSport('a26', 'วิ่งระยะ 100 ม.', 'หญิง 12 ปี', 'Timer', 'athletics'),
  createSport('a27', 'วิ่งผลัด 5x80 ม.', 'ชาย 8 ปี', 'Users', 'athletics'),
  createSport('a28', 'วิ่งผลัด 5x80 ม.', 'หญิง 8 ปี', 'Users', 'athletics'),
  createSport('a29', 'วิ่งผลัด 5x80 ม.', 'ชาย 10 ปี', 'Users', 'athletics'),
  createSport('a30', 'วิ่งผลัด 5x80 ม.', 'หญิง 10 ปี', 'Users', 'athletics'),
  createSport('a31', 'วิ่งผลัด 4x100 ม.', 'ชาย 12 ปี', 'Users', 'athletics'),
  createSport('a32', 'วิ่งผลัด 4x100 ม.', 'หญิง 12 ปี', 'Users', 'athletics'),

  // --- กีฬาประเภททีม (Bracket System) ---
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
  createSport('s15', 'เปตอง', 'ทีมชาย', 'Circle', 'petanque'),
  createSport('s16', 'เปตอง', 'ทีมหญิง', 'Circle', 'petanque'),
  createSport('s17', 'แบดมินตัน', 'ชายเดี่ยว', 'Dna', 'badminton'),
  createSport('s18', 'แบดมินตัน', 'หญิงเดี่ยว', 'Dna', 'badminton'),
  createSport('s19', 'หมากรุก', 'บุคคลชาย', 'Square', 'chess'),
  createSport('s20', 'หมากรุก', 'บุคคลหญิง', 'Square', 'chess'),
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
    case 'Timer': return <Timer {...props} />;
    case 'Footprints': return <Footprints {...props} />;
    case 'Baby': return <Baby {...props} />;
    case 'Bike': return <Bike {...props} />;
    default: return <Activity {...props} />;
  }
};
