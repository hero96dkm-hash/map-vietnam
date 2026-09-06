import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameLogic } from '../hooks/useGameLogic';
import { PartyPopper, AlertCircle, RotateCcw, ArrowRight, Award, CheckCircle, MapPin } from 'lucide-react';

export const ResultModal: React.FC = () => {
  const {
    isResultModalOpen,
    checkResult,
    closeResultModal,
    clearSelection,
    currentLevel,
    nextLevel1Target,
  } = useGameLogic();

  useEffect(() => {
    if (isResultModalOpen && checkResult) {
      if (checkResult.isCorrect) {
        // Soft celebratory confetti
        const duration = 1.8 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 26, spread: 360, ticks: 50, zIndex: 9999 };

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 35 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#f97316'],
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#f97316'],
          });
        }, 300);

        return () => clearInterval(interval);
      }
    }
  }, [isResultModalOpen, checkResult]);

  if (!isResultModalOpen || !checkResult) return null;

  const handleClose = () => {
    closeResultModal();
    if (currentLevel === 1 && checkResult.isCorrect) {
      nextLevel1Target();
    }
  };

  const handleRetry = () => {
    clearSelection();
    closeResultModal();
  };

  const handleContinue = () => {
    closeResultModal();
    if (currentLevel === 1 && checkResult.isCorrect) {
      nextLevel1Target();
    }
  };

  const targetProvince = checkResult.selectedProvinces[0];

  return (
    <AnimatePresence>
      <div
        id="result-modal-backdrop"
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex min-h-full items-center justify-center p-4 sm:p-6"
        onClick={handleClose}
      >
        <motion.div
          id="result-modal-card"
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-white/90 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto relative"
        >
          {checkResult.isCorrect ? (
            /* SUCCESS MODAL */
            currentLevel === 1 ? (
              /* CẤP ĐỘ 1: CHÚC MỪNG TÌM ĐÚNG TỈNH */
              <div className="text-center">
                {/* Header Icon */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
                  <PartyPopper size={44} />
                </div>

                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black uppercase tracking-wider mb-2">
                  Nhận biết chính xác
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  🎉 CHÚC MỪNG EM!
                </h3>

                <p className="text-base sm:text-lg font-bold text-slate-600 mt-1 mb-4">
                  Em đã tìm đúng vị trí của tỉnh:
                </p>

                {/* Level 1 Province Card */}
                {targetProvince && (
                  <div className="bg-gradient-to-br from-blue-50/90 to-emerald-50/80 rounded-3xl p-5 border-2 border-emerald-200/80 mb-6 text-left shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700 font-black text-xs sm:text-sm uppercase tracking-wider">
                      <MapPin size={18} className="text-emerald-600 flex-shrink-0" />
                      <span>Tỉnh thành trên bản đồ Việt Nam:</span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black text-blue-800 mb-3">
                      {targetProvince.oldProvince}
                    </div>

                    <div className="space-y-2 text-sm sm:text-base text-slate-700 border-t border-blue-100 pt-3">
                      <div>
                        • Thuộc vùng: <strong className="text-blue-700 font-bold">{targetProvince.region}</strong>
                      </div>
                      {targetProvince.capital && (
                        <div>
                          • Trung tâm hành chính: <strong className="text-slate-900 font-bold">{targetProvince.capital}</strong>
                        </div>
                      )}
                      {targetProvince.fact && (
                        <div className="text-xs sm:text-sm text-slate-600 italic mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                          "{targetProvince.fact}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  id="btn-modal-continue"
                  onClick={handleContinue}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer min-h-[54px]"
                >
                  <span>Tiếp tục tìm tỉnh tiếp theo</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              /* CẤP ĐỘ 2 & 3: CHÚC MỪNG GHÉP TỈNH MỚI */
              <div className="text-center">
                {/* Header Icon */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center shadow-md shadow-amber-400/30 mb-4">
                  <PartyPopper size={44} />
                </div>

                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black uppercase tracking-wider mb-2">
                  Ghép thành công
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  🎉 CHÚC MỪNG EM!
                </h3>

                <p className="text-base sm:text-lg font-bold text-slate-600 mt-1 mb-4">
                  Em đã ghép đúng các tỉnh thành:
                </p>

                {/* List of matched provinces */}
                <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200/80 mb-6 text-left">
                  <div className="font-black text-xs sm:text-sm text-amber-900 uppercase tracking-wider mb-3">
                    Các tỉnh đã chọn:
                  </div>

                  <ul className="space-y-2 mb-4">
                    {checkResult.selectedProvinces.map((p) => (
                      <li key={p.id} className="flex items-center gap-2.5 text-base font-black text-slate-800">
                        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                        <span>{p.oldProvince}</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-500">({p.region})</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3.5 border-t border-amber-200/70">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-600">Đã tạo thành:</div>
                    <div className="text-xl sm:text-2xl font-black text-edu-blue mt-1">
                      "{checkResult.matchedGroup?.newProvince}"
                    </div>
                    {checkResult.matchedGroup?.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 italic leading-relaxed">
                        {checkResult.matchedGroup.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  id="btn-modal-continue"
                  onClick={handleContinue}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-edu-blue to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer min-h-[54px]"
                >
                  <span>Tiếp tục thử thách tiếp theo</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )
          ) : (
            /* ERROR MODAL */
            <div className="text-center">
              {/* Header Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-red-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-red-500/20 mb-4 animate-gentle-shake">
                <AlertCircle size={44} />
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-black uppercase tracking-wider mb-2">
                Chưa chính xác
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                ❌ CHƯA ĐÚNG RỒI
              </h3>

              <p className="text-base sm:text-lg font-bold text-slate-600 mt-1 mb-4">
                {checkResult.message}
              </p>

              {/* Hints Box */}
              <div className="bg-rose-50/70 rounded-3xl p-5 border border-rose-200/80 mb-6 text-left">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-rose-800 uppercase tracking-wider mb-3">
                  <Award size={18} />
                  <span>Gợi ý cho em:</span>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold list-disc list-inside leading-relaxed">
                  {checkResult.hints && checkResult.hints.length > 0 ? (
                    checkResult.hints.map((hint, idx) => (
                      <li key={idx}>
                        {hint}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>Kiểm tra lại số lượng tỉnh thành cần ghép.</li>
                      <li>Xem lại khu vực địa lý lân cận nhau.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="btn-modal-retry"
                  onClick={handleRetry}
                  className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer min-h-[52px]"
                >
                  <RotateCcw size={18} />
                  <span>Chọn lại</span>
                </button>
                <button
                  id="btn-modal-close"
                  onClick={closeResultModal}
                  className="flex-1 py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base transition-colors cursor-pointer min-h-[52px]"
                >
                  <span>Xem lại bản đồ</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
