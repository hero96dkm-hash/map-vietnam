import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameLogic } from '../hooks/useGameLogic';
import { soundManager } from '../utils/soundEffects';
import {
  Compass,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  X,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { resetGame } = useGameLogic();
  const [isMuted, setIsMuted] = useState(!soundManager.isEnabled());
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleToggleSound = () => {
    const enabled = soundManager.toggleSound();
    setIsMuted(!enabled);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Main Title with Large Child-Friendly Typography */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-edu-green via-edu-blue to-edu-yellow flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Compass size={28} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                Khám phá bản đồ Việt Nam
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                Trò chơi ghép tỉnh thành - Dành cho học sinh tiểu học
              </p>
            </div>
          </div>

          {/* Large Kid-Friendly Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-sound-toggle"
              onClick={handleToggleSound}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isMuted
                  ? 'bg-slate-100 border-slate-300 text-slate-400'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 shadow-xs'
              }`}
              title={isMuted ? 'Bật âm thanh & giọng đọc' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span className="hidden md:inline font-black text-xs">
                {isMuted ? 'Âm thanh: Tắt' : 'Âm thanh: Bật'}
              </span>
            </button>

            <button
              id="btn-reset-game"
              onClick={resetGame}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Làm mới lại trò chơi"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">Chơi lại</span>
            </button>

            <button
              id="btn-help-guide"
              onClick={() => setIsHelpOpen(true)}
              className="p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Hướng dẫn chơi"
            >
              <HelpCircle size={20} className="text-amber-600" />
              <span className="hidden sm:inline">Cách chơi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Help Modal - Portal to document.body */}
      {isHelpOpen &&
        createPortal(
          <div
            id="help-modal-backdrop"
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6"
            onClick={() => setIsHelpOpen(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-white my-auto max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5 text-xl font-black text-slate-800">
                  <Compass size={26} className="text-edu-blue" />
                  <span>Cách chơi rất đơn giản!</span>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>


              <div className="space-y-4 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                <div className="flex items-start gap-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  <CheckCircle2 size={22} className="text-edu-blue flex-shrink-0 mt-0.5" />
                  <span><strong>Bước 1:</strong> Bấm chuột vào các tỉnh cũ trên bản đồ (tỉnh được chọn sẽ có màu xanh dương).</span>
                </div>
                <div className="flex items-start gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                  <CheckCircle2 size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bước 2:</strong> Xem danh sách các tỉnh đang chọn ở bảng bên phải.</span>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bước 3:</strong> Bấm nút <strong>[Kiểm tra kết quả]</strong> để xem em đã ghép đúng thành tỉnh mới nào nhé!</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-edu-blue to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-base shadow-md transition-all cursor-pointer active:scale-98 min-h-[52px]"
                >
                  Đã hiểu, em chơi ngay!
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
