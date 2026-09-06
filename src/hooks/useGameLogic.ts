import { create } from 'zustand';
import type { Province, ProvinceGroup, CheckResult, GameLevel, Badge } from '../types/game';
import provincesData from '../data/provinces.json';
import provinceGroupsData from '../data/provinceGroups.json';
import { checkAnswer } from '../utils/checkAnswer';
import { soundManager } from '../utils/soundEffects';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'rookie_explorer',
    title: 'Nhà Thám Hiểm Tập Sự',
    description: 'Tìm đúng 3 tỉnh cũ trong Cấp độ 1',
    icon: '🧭',
    category: 'level1',
    isUnlocked: false,
  },
  {
    id: 'geo_master',
    title: 'Bậc Thầy Địa Lý',
    description: 'Tìm đúng 10 tỉnh cũ trong Cấp độ 1',
    icon: '🗺️',
    category: 'level1',
    isUnlocked: false,
  },
  {
    id: 'master_builder',
    title: 'Nhà Kiến Thiết',
    description: 'Ghép đúng 5 tỉnh mới trong Cấp độ 2',
    icon: '🏛️',
    category: 'level2',
    isUnlocked: false,
  },
  {
    id: 'combo_king',
    title: 'Bách Phát Bách Trúng',
    description: 'Đạt chuỗi 5 lần trả lời đúng liên tiếp',
    icon: '🔥',
    category: 'general',
    isUnlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Tia Chớp 60 Giây',
    description: 'Đạt từ 500 điểm trở lên trong Cấp độ 3 (Thử thách 60 giây)',
    icon: '⚡',
    category: 'level3',
    isUnlocked: false,
  },
  {
    id: 'grandmaster',
    title: 'Đại Sứ Bản Đồ Việt Nam',
    description: 'Đạt tổng điểm từ 1,500 điểm',
    icon: '👑',
    category: 'general',
    isUnlocked: false,
  },
];

// Load persisted state
const getStoredHighScore = (): number => {
  try {
    return parseInt(localStorage.getItem('vn_map_highscore') || '0', 10);
  } catch {
    return 0;
  }
};

const getStoredBadges = (): Badge[] => {
  try {
    const raw = localStorage.getItem('vn_map_badges');
    if (!raw) return INITIAL_BADGES;
    const unlockedIds: string[] = JSON.parse(raw);
    return INITIAL_BADGES.map((b) => ({
      ...b,
      isUnlocked: unlockedIds.includes(b.id),
    }));
  } catch {
    return INITIAL_BADGES;
  }
};

interface GameState {
  // Data
  provinces: Province[];
  groups: ProvinceGroup[];

  // Level selection (1: Recognize old province, 2: Merge new province, 3: 60s Time Attack)
  currentLevel: GameLevel;
  setLevel: (lvl: GameLevel) => void;

  // Global Score & High Score
  score: number;
  highScore: number;
  comboStreak: number;

  // Badges
  badges: Badge[];
  newlyUnlockedBadge: Badge | null;
  clearNewlyUnlockedBadge: () => void;
  isBadgesModalOpen: boolean;
  setIsBadgesModalOpen: (open: boolean) => void;

  // LEVEL 1 State: Recognize old province
  targetProvince: Province | null;
  level1FoundIds: number[];
  showLevel1Hint: boolean;
  level1Feedback: { isCorrect: boolean; message: string; provinceName?: string } | null;
  guessLevel1Province: (id: number) => void;
  nextLevel1Target: () => void;
  toggleLevel1Hint: () => void;

  // LEVEL 2 State: Merge new provinces
  selectedProvinceIds: number[];
  completedGroupIds: string[];
  checkResult: CheckResult | null;
  isResultModalOpen: boolean;
  toggleProvince: (id: number) => void;
  removeProvince: (id: number) => void;
  clearSelection: () => void;
  checkCurrentSelection: () => void;
  closeResultModal: () => void;

  // LEVEL 3 State: 60s Time Attack
  timeLeft: number;
  isTimerRunning: boolean;
  level3Score: number;
  level3Matches: number;
  isLevel3GameOver: boolean;
  startLevel3Timer: () => void;
  stopLevel3Timer: () => void;
  resetLevel3Timer: () => void;
  tickLevel3Timer: () => void;

  // Reset all
  resetGame: () => void;
}

export const useGameLogic = create<GameState>((set, get) => {
  const provinces = provincesData as Province[];
  const groups = provinceGroupsData as ProvinceGroup[];

  // Helper to pick random target province for Level 1
  const getRandomProvince = (excludeIds: number[]): Province => {
    const pool = provinces.filter((p) => !excludeIds.includes(p.id));
    if (pool.length === 0) return provinces[Math.floor(Math.random() * provinces.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const initialTarget = provinces[Math.floor(Math.random() * provinces.length)];

  // Helper to unlock badge and check criteria
  const checkAndUnlockBadges = (
    currentScore: number,
    streak: number,
    level1Count: number,
    level2GroupCount: number,
    level3Score: number
  ) => {
    const { badges } = get();
    let newlyUnlocked: Badge | null = null;
    const updatedBadges = badges.map((badge) => {
      if (badge.isUnlocked) return badge;

      let shouldUnlock = false;
      if (badge.id === 'rookie_explorer' && level1Count >= 3) shouldUnlock = true;
      if (badge.id === 'geo_master' && level1Count >= 10) shouldUnlock = true;
      if (badge.id === 'master_builder' && level2GroupCount >= 5) shouldUnlock = true;
      if (badge.id === 'combo_king' && streak >= 5) shouldUnlock = true;
      if (badge.id === 'speed_demon' && level3Score >= 500) shouldUnlock = true;
      if (badge.id === 'grandmaster' && currentScore >= 1500) shouldUnlock = true;

      if (shouldUnlock) {
        newlyUnlocked = { ...badge, isUnlocked: true, unlockedAt: new Date().toLocaleDateString() };
        soundManager.playCelebration();
        return newlyUnlocked;
      }
      return badge;
    });

    if (newlyUnlocked) {
      const unlockedIds = updatedBadges.filter((b) => b.isUnlocked).map((b) => b.id);
      try {
        localStorage.setItem('vn_map_badges', JSON.stringify(unlockedIds));
      } catch {
        // ignore storage errors
      }
      set({ badges: updatedBadges, newlyUnlockedBadge: newlyUnlocked });
    }
  };

  const updateHighScore = (newScore: number) => {
    const { highScore } = get();
    if (newScore > highScore) {
      try {
        localStorage.setItem('vn_map_highscore', newScore.toString());
      } catch {
        // ignore
      }
      set({ highScore: newScore });
    }
  };

  return {
    provinces,
    groups,

    // Level selection
    currentLevel: 1,
    setLevel: (lvl: GameLevel) => {
      soundManager.playClick();
      set({
        currentLevel: lvl,
        selectedProvinceIds: [],
        checkResult: null,
        level1Feedback: null,
      });

      // If switching to Level 1 and no target, pick one
      if (lvl === 1 && !get().targetProvince) {
        set({ targetProvince: getRandomProvince([]) });
      }
      // If switching to Level 3, prepare timer
      if (lvl === 3) {
        set({
          timeLeft: 60,
          isTimerRunning: false,
          isLevel3GameOver: false,
          level3Score: 0,
          level3Matches: 0,
        });
      }
    },

    // Global Score
    score: 0,
    highScore: getStoredHighScore(),
    comboStreak: 0,

    // Badges
    badges: getStoredBadges(),
    newlyUnlockedBadge: null,
    clearNewlyUnlockedBadge: () => set({ newlyUnlockedBadge: null }),
    isBadgesModalOpen: false,
    setIsBadgesModalOpen: (open: boolean) => set({ isBadgesModalOpen: open }),

    // LEVEL 1: Recognize old province
    targetProvince: initialTarget,
    level1FoundIds: [],
    showLevel1Hint: false,
    level1Feedback: null,

    guessLevel1Province: (id: number) => {
      const { targetProvince, score, comboStreak, level1FoundIds } = get();
      if (!targetProvince) return;

      const guessed = provinces.find((p) => p.id === id);
      if (!guessed) return;

      if (id === targetProvince.id) {
        // Correct guess!
        soundManager.playSuccess();
        const newStreak = comboStreak + 1;
        const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
        const earned = Math.round(100 * multiplier);
        const newScore = score + earned;
        const newFound = [...level1FoundIds, id];

        updateHighScore(newScore);
        checkAndUnlockBadges(newScore, newStreak, newFound.length, get().completedGroupIds.length, get().level3Score);

        set({
          score: newScore,
          comboStreak: newStreak,
          level1FoundIds: newFound,
          level1Feedback: {
            isCorrect: true,
            message: `Chính xác! +${earned} điểm (Chuỗi đúng x${multiplier})`,
            provinceName: targetProvince.oldProvince,
          },
          checkResult: {
            isCorrect: true,
            message: `Chính xác! Em đã tìm đúng vị trí của tỉnh ${targetProvince.oldProvince}!`,
            selectedProvinces: [targetProvince],
          },
          isResultModalOpen: true,
          showLevel1Hint: false,
        });
      } else {
        // Wrong guess
        soundManager.playError();
        set({
          comboStreak: 0,
          level1Feedback: {
            isCorrect: false,
            message: `Chưa đúng rồi! Đây là tỉnh ${guessed.oldProvince}. Hãy thử lại nhé!`,
            provinceName: guessed.oldProvince,
          },
        });
      }
    },

    nextLevel1Target: () => {
      const { level1FoundIds } = get();
      set({
        targetProvince: getRandomProvince(level1FoundIds),
        showLevel1Hint: false,
        level1Feedback: null,
      });
    },

    toggleLevel1Hint: () => {
      soundManager.playClick();
      set((state) => ({ showLevel1Hint: !state.showLevel1Hint }));
    },

    // LEVEL 2 & 3 Province selection
    selectedProvinceIds: [],
    completedGroupIds: [],
    checkResult: null,
    isResultModalOpen: false,

    toggleProvince: (id: number) => {
      const { currentLevel, selectedProvinceIds, completedGroupIds } = get();

      // If in Level 1, dispatch guess directly!
      if (currentLevel === 1) {
        get().guessLevel1Province(id);
        return;
      }

      // If in Level 2 or Level 3:
      const province = provinces.find((p) => p.id === id);
      if (!province) return;

      // In Level 3, if timer is not running, start it on first click!
      if (currentLevel === 3 && !get().isTimerRunning && !get().isLevel3GameOver) {
        get().startLevel3Timer();
      }

      if (completedGroupIds.includes(province.groupId)) {
        soundManager.playClick();
        return;
      }

      if (selectedProvinceIds.includes(id)) {
        soundManager.playDeselect();
        set({
          selectedProvinceIds: selectedProvinceIds.filter((item) => item !== id),
        });
      } else {
        soundManager.playClick();
        set({
          selectedProvinceIds: [...selectedProvinceIds, id],
        });
      }
    },

    removeProvince: (id: number) => {
      soundManager.playDeselect();
      set((state) => ({
        selectedProvinceIds: state.selectedProvinceIds.filter((item) => item !== id),
      }));
    },

    clearSelection: () => {
      set({ selectedProvinceIds: [] });
    },

    checkCurrentSelection: () => {
      const {
        selectedProvinceIds,
        completedGroupIds,
        currentLevel,
        score,
        level3Score,
        level3Matches,
        comboStreak,
      } = get();
      const selectedProvinces = provinces.filter((p) => selectedProvinceIds.includes(p.id));

      const result = checkAnswer(selectedProvinces, groups);

      if (result.isCorrect && result.matchedGroup) {
        soundManager.playSuccess();

        const matchedId = result.matchedGroup.groupId;
        const newCompleted = completedGroupIds.includes(matchedId)
          ? completedGroupIds
          : [...completedGroupIds, matchedId];

        const newStreak = comboStreak + 1;
        const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
        const earned = Math.round(200 * multiplier);
        const newScore = score + earned;
        const newL3Score = level3Score + earned;
        const newL3Matches = level3Matches + 1;

        updateHighScore(newScore);
        checkAndUnlockBadges(
          newScore,
          newStreak,
          get().level1FoundIds.length,
          newCompleted.length,
          newL3Score
        );

        set({
          score: newScore,
          comboStreak: newStreak,
          level3Score: newL3Score,
          level3Matches: newL3Matches,
          checkResult: result,
          isResultModalOpen: currentLevel !== 3, // In Level 3, keep game fast-paced
          completedGroupIds: newCompleted,
          selectedProvinceIds: [],
        });

        if (newCompleted.length === groups.length) {
          soundManager.playCelebration();
        }
      } else {
        soundManager.playError();
        set({
          comboStreak: 0,
          checkResult: result,
          isResultModalOpen: currentLevel !== 3,
        });
      }
    },

    closeResultModal: () => {
      set({ isResultModalOpen: false });
    },

    // LEVEL 3: 60s Time Attack
    timeLeft: 60,
    isTimerRunning: false,
    level3Score: 0,
    level3Matches: 0,
    isLevel3GameOver: false,

    startLevel3Timer: () => {
      set({ isTimerRunning: true, isLevel3GameOver: false });
    },

    stopLevel3Timer: () => {
      set({ isTimerRunning: false });
    },

    resetLevel3Timer: () => {
      set({
        timeLeft: 60,
        isTimerRunning: false,
        isLevel3GameOver: false,
        level3Score: 0,
        level3Matches: 0,
        selectedProvinceIds: [],
        completedGroupIds: [],
      });
    },

    tickLevel3Timer: () => {
      const { timeLeft, isTimerRunning } = get();
      if (!isTimerRunning) return;

      if (timeLeft <= 1) {
        soundManager.playCelebration();
        set({
          timeLeft: 0,
          isTimerRunning: false,
          isLevel3GameOver: true,
        });
      } else {
        set({ timeLeft: timeLeft - 1 });
      }
    },

    resetGame: () => {
      soundManager.playClick();
      set({
        selectedProvinceIds: [],
        completedGroupIds: [],
        checkResult: null,
        isResultModalOpen: false,
        score: 0,
        comboStreak: 0,
        level1FoundIds: [],
        level1Feedback: null,
        targetProvince: getRandomProvince([]),
        timeLeft: 60,
        isTimerRunning: false,
        isLevel3GameOver: false,
        level3Score: 0,
        level3Matches: 0,
      });
    },
  };
});
