export interface Province {
  id: number;
  code: string;
  oldProvince: string;
  newProvince: string;
  groupId: string;
  region: string;
  area: number;
  population: number;
  capital: string;
  fact: string;
  svgPath?: string;
  bbox?: [number, number, number, number];
  centroid?: [number, number];
  isKept?: boolean;
  featureIndex?: number;
}

export interface ProvinceGroup {
  groupId: string;
  newProvince: string;
  description: string;
  region: string;
  provinces: string[];
  color: string;
}

export type GameLevel = 1 | 2 | 3;

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'level1' | 'level2' | 'level3' | 'general';
  isUnlocked: boolean;
  unlockedAt?: string;
}

export type GameMode = 'explore' | 'challenge' | 'competition';

export type ProvinceStatus = 'default' | 'selected' | 'correct' | 'wrong' | 'target_correct' | 'target_wrong';

export interface ScoreRecord {
  id: string;
  playerName: string;
  score: number;
  matchedGroups: number;
  timeSpent: number;
  date: string;
}

export interface CheckResult {
  isCorrect: boolean;
  matchedGroup?: ProvinceGroup;
  message: string;
  selectedProvinces: Province[];
  missingCount?: number;
  extraCount?: number;
  hints?: string[];
}
