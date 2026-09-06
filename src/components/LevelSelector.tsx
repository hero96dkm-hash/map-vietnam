import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import type { GameLevel } from '../types/game';
import { Target, Puzzle, Timer, Award, Trophy, Flame, Sparkles } from 'lucide-react';

export const LevelSelector: React.FC = () => {
  const {
    currentLevel,
    setLevel,
    score,
    highScore,
    comboStreak,
    badges,
    setIsBadgesModalOpen,
    newlyUnlockedBadge,
    clearNewlyUnlockedBadge,
  } = useGameLogic();

  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  const levels: { id: GameLevel; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 1,
      label: 'Cấp độ 1',
      desc: 'Nhận biết tỉnh cũ',
      icon: <Target size={20} />,
    },
    {
      id: 2,
      label: 'Cấp độ 2',
      desc: 'Ghép tỉnh mới',
      icon: <Puzzle size={20} />,
    },
    {
      id: 3,
      label: 'Cấp độ 3',
      desc: 'Thử thách 60 giây',
      icon: <Timer size={20} />,
    },
  ];

  return (
    <div className="w-full mb-5">
      {/* Toast Notification when a new badge is unlocked */}
      {newlyUnlockedBadge && (
        <div className="mb-3.5 p-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 rounded-3xl shadow-lg border-2 border-yellow-200 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">{newlyUnlockedBadge.icon}</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-950">
                🎉 HUY HIỆU MỚI ĐƯỢC MỞ KHÓA!
              </div>
              <div className="text-base font-black">{newlyUnlockedBadge.title}</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearNewlyUnlockedBadge();
              setIsBadgesModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-slate-900 rounded-2xl font-black text-xs sm:text-sm shadow-sm hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            Xem ngay
          </button>
        </div>
      )}

      {/* Main Bar: Level Pills on the left, Score & Badges on the right */}
      <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl border-2 border-blue-100 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Large Child-Friendly Level Tabs */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {levels.map((lvl) => {
            const isActive = currentLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                id={`btn-level-${lvl.id}`}
                onClick={() => setLevel(lvl.id)}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-edu-blue to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{lvl.icon}</span>
                <span className="font-black">{lvl.label}:</span>
                <span className="font-semibold hidden md:inline">{lvl.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Stats & Badges Button */}
        <div className="flex items-center gap-2.5 ml-auto flex-wrap">
          {/* Combo Streak if > 1 */}
          {comboStreak > 1 && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-100 border border-orange-200 text-orange-700 text-xs sm:text-sm font-black">
              <Flame size={16} className="text-orange-600" />
              <span>Chuỗi x{comboStreak}</span>
            </div>
          )}

          {/* Current Score */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 text-xs sm:text-sm font-extrabold">
            <Sparkles size={18} className="text-amber-500" />
            <span>
              Điểm: <strong className="text-amber-600 text-sm sm:text-base font-black">{score}</strong>
            </span>
          </div>

          {/* High Score */}
          {highScore > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 text-xs sm:text-sm font-extrabold">
              <Trophy size={18} className="text-emerald-600" />
              <span>
                Kỷ lục: <strong className="text-emerald-700 font-black">{highScore}</strong>
              </span>
            </div>
          )}

          {/* Badges Button */}
          <button
            id="btn-open-badges"
            onClick={() => setIsBadgesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
            title="Xem bộ sưu tập huy hiệu"
          >
            <Award size={18} />
            <span>Huy hiệu</span>
            <span className="px-2 py-0.5 bg-white/80 rounded-lg text-xs font-black">
              {unlockedBadgesCount}/{badges.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
