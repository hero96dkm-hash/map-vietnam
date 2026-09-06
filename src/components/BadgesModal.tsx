import React from 'react';
import { createPortal } from 'react-dom';
import { useGameLogic } from '../hooks/useGameLogic';
import { X, Lock, CheckCircle2, Trophy } from 'lucide-react';

export const BadgesModal: React.FC = () => {
  const { badges, isBadgesModalOpen, setIsBadgesModalOpen } = useGameLogic();

  if (!isBadgesModalOpen) return null;

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return createPortal(
    <div
      id="badges-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6"
      onClick={() => setIsBadgesModalOpen(false)}
    >
      <div
        id="badges-modal-card"
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-4 border-white/90 my-auto max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-md shadow-amber-500/10">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Bộ Sưu Tập Huy Hiệu
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                Đã mở khóa: <span className="text-amber-600 font-black">{unlockedCount}</span>/{badges.length} danh hiệu
              </p>
            </div>
          </div>
          <button
            id="btn-close-badges-modal"
            onClick={() => setIsBadgesModalOpen(false)}
            className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-white border-amber-300 shadow-md shadow-amber-400/10'
                  : 'bg-slate-50/80 border-slate-200 opacity-65'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-xs ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-amber-500/30'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.isUnlocked ? badge.icon : <Lock size={22} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-slate-800 truncate">
                    {badge.title}
                  </h3>
                  {badge.isUnlocked && (
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                  {badge.description}
                </p>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span className="inline-block mt-2 text-xs font-black text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-lg">
                    Đạt được: {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsBadgesModalOpen(false)}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-md transition-all cursor-pointer active:scale-98 min-h-[50px]"
          >
            Đóng bảng thành tích
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
