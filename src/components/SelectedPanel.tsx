import React, { useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import {
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  HelpCircle,
  Award,
  PlusCircle,
  Target,
  Lightbulb,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Trophy,
  CheckCircle,
} from 'lucide-react';

export const SelectedPanel: React.FC = () => {
  const {
    currentLevel,
    provinces,
    groups,
    // Level 1
    targetProvince,
    level1FoundIds,
    showLevel1Hint,
    level1Feedback,
    nextLevel1Target,
    toggleLevel1Hint,
    // Level 2
    selectedProvinceIds,
    completedGroupIds,
    toggleProvince,
    removeProvince,
    clearSelection,
    checkCurrentSelection,
    // Level 3
    timeLeft,
    isTimerRunning,
    level3Score,
    level3Matches,
    isLevel3GameOver,
    startLevel3Timer,
    stopLevel3Timer,
    resetLevel3Timer,
    tickLevel3Timer,
  } = useGameLogic();

  // Timer interval for Level 3
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (currentLevel === 3 && isTimerRunning) {
      interval = setInterval(() => {
        tickLevel3Timer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentLevel, isTimerRunning, tickLevel3Timer]);

  const selectedProvinces = provinces.filter((p) => selectedProvinceIds.includes(p.id));

  // Sort provinces alphabetically for quick dropdown
  const sortedProvinces = [...provinces].sort((a, b) =>
    a.oldProvince.localeCompare(b.oldProvince, 'vi')
  );

  const handleQuickAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      toggleProvince(val);
      e.target.value = '';
    }
  };

  // ==========================================
  // LEVEL 1: NHẬN BIẾT TỈNH CŨ
  // ==========================================
  if (currentLevel === 1) {
    return (
      <div
        id="level1-panel"
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-2 border-blue-100 shadow-xl flex flex-col justify-between min-h-[540px]"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                <Target size={26} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Cấp độ 1: Nhận biết tỉnh cũ
                </h2>
                <p className="text-sm text-slate-500 font-semibold mt-0.5">
                  Bấm vào tỉnh tương ứng trên bản đồ
                </p>
              </div>
            </div>

            <div className="px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-black shadow-2xs">
              {level1FoundIds.length}/63 tỉnh
            </div>
          </div>

          {/* Target Province Card */}
          {targetProvince ? (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-emerald-50/30 p-6 rounded-3xl border-2 border-blue-200/80 shadow-sm mb-5 text-center">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-600 mb-1.5 flex items-center justify-center gap-1.5">
                <Sparkles size={16} />
                <span>Nhiệm vụ của em:</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-700 mb-2">
                Hãy tìm và bấm vào tỉnh:
              </p>

              {/* Large, super-clear province name for kids */}
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 bg-clip-text text-transparent my-3 py-1">
                {targetProvince.oldProvince}
              </div>

              {/* Hint Section */}
              {showLevel1Hint ? (
                <div className="bg-white/95 rounded-2xl p-4 border border-blue-200 text-left text-sm space-y-2 animate-in fade-in duration-200 shadow-xs">
                  <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm sm:text-base">
                    <Lightbulb size={18} className="text-amber-500 flex-shrink-0" />
                    <span>Gợi ý địa lý:</span>
                  </div>
                  <div className="text-slate-800 font-medium">
                    • Thuộc vùng: <strong className="text-blue-700 font-bold">{targetProvince.region}</strong>
                  </div>
                  {targetProvince.capital && (
                    <div className="text-slate-800 font-medium">
                      • Trung tâm hành chính: <strong className="text-slate-900 font-bold">{targetProvince.capital}</strong>
                    </div>
                  )}
                  {targetProvince.fact && (
                    <div className="text-slate-600 italic text-xs sm:text-sm mt-1 pt-1.5 border-t border-slate-100">
                      "{targetProvince.fact}"
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-level1-hint"
                  onClick={toggleLevel1Hint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-sm shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <Lightbulb size={18} className="text-amber-500" />
                  <span>Xem gợi ý vùng miền</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-base font-bold">Đang tải nhiệm vụ...</div>
          )}

          {/* Feedback Message */}
          {level1Feedback && (
            <div
              className={`p-4 rounded-2xl border-2 mb-4 text-sm sm:text-base font-black flex items-center gap-3 animate-in fade-in duration-200 ${
                level1Feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-700'
              }`}
            >
              {level1Feedback.isCorrect ? (
                <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <HelpCircle size={24} className="text-red-500 flex-shrink-0" />
              )}
              <span>{level1Feedback.message}</span>
            </div>
          )}
        </div>

        {/* Action Controls: Large, easy to tap */}
        <div className="pt-4 border-t border-slate-100">
          <button
            id="btn-skip-target"
            onClick={nextLevel1Target}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[50px]"
          >
            <span>Đổi sang tỉnh khác</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // LEVEL 3: THỬ THÁCH THỜI GIAN 60S
  // ==========================================
  if (currentLevel === 3) {
    const timerPercentage = (timeLeft / 60) * 100;
    const isUrgent = timeLeft <= 15;

    return (
      <div
        id="level3-panel"
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-2 border-red-100 shadow-xl flex flex-col justify-between min-h-[540px]"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold shadow-sm">
                <Timer size={26} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Cấp độ 3: Thử thách 60 giây
                </h2>
                <p className="text-sm text-slate-500 font-semibold mt-0.5">
                  Ghép được càng nhiều tỉnh càng tốt!
                </p>
              </div>
            </div>

            <button
              onClick={resetLevel3Timer}
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Chơi lại thử thách 60s"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* 60s Countdown Display */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-lg mb-5 text-center relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Thời gian còn lại</div>
                <div
                  className={`text-5xl sm:text-6xl font-black tracking-tight font-mono my-1 ${
                    isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Điểm thử thách</div>
                <div className="text-4xl sm:text-5xl font-black text-white my-1">{level3Score}</div>
                <div className="text-xs sm:text-sm text-emerald-400 font-extrabold">
                  {level3Matches} tỉnh đã ghép
                </div>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-700/60 h-3 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isUrgent ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-amber-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>

          {/* Game Over Modal State */}
          {isLevel3GameOver ? (
            <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-300 text-center animate-in zoom-in-95 duration-200">
              <Trophy size={48} className="mx-auto text-amber-500 mb-2" />
              <h3 className="text-2xl font-black text-slate-800 mb-1">HẾT GIỜ!</h3>
              <p className="text-sm sm:text-base text-slate-700 font-bold mb-4">
                Em đã đạt <strong className="text-amber-600 text-lg sm:text-xl font-black">{level3Score} điểm</strong> và ghép thành công {level3Matches} nhóm tỉnh!
              </p>
              <button
                onClick={resetLevel3Timer}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-base sm:text-lg shadow-md hover:brightness-105 transition-all cursor-pointer active:scale-98 min-h-[54px]"
              >
                Chơi lại thử thách
              </button>
            </div>
          ) : (
            <div>
              {/* Play / Pause Toggle Button: Large hit area */}
              <div className="mb-4">
                {!isTimerRunning ? (
                  <button
                    onClick={startLevel3Timer}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98 min-h-[54px]"
                  >
                    <Play size={20} />
                    <span>Bắt đầu tính giờ</span>
                  </button>
                ) : (
                  <button
                    onClick={stopLevel3Timer}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-98 min-h-[54px]"
                  >
                    <Pause size={20} />
                    <span>Tạm dừng</span>
                  </button>
                )}
              </div>

              {/* Selected for matching in Level 3 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="font-black text-slate-700 text-sm mb-2">
                  Đang chọn ({selectedProvinces.length}):
                </div>
                {selectedProvinces.length === 0 ? (
                  <p className="text-slate-400 italic text-sm">Bấm nhanh các tỉnh trên bản đồ để ghép...</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProvinces.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1 bg-blue-100 text-blue-900 rounded-xl font-black text-xs sm:text-sm"
                      >
                        {p.oldProvince}
                      </span>
                    ))}
                  </div>
                )}

                {selectedProvinces.length >= 2 && (
                  <button
                    onClick={checkCurrentSelection}
                    className="w-full py-3.5 rounded-2xl bg-edu-blue hover:bg-blue-600 text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer active:scale-98 min-h-[48px]"
                  >
                    Kiểm tra ghép ngay
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // LEVEL 2: GHÉP TỈNH MỚI (DEFAULT)
  // ==========================================
  return (
    <div
      id="selected-panel"
      className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border-2 border-blue-100 shadow-xl flex flex-col justify-between h-full min-h-[540px]"
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-edu-blue/10 flex items-center justify-center text-edu-blue font-bold shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Cấp độ 2: Ghép tỉnh mới
              </h2>
              <p className="text-sm text-slate-500 font-semibold mt-0.5">
                Đã chọn: <span className="text-edu-blue font-black">{selectedProvinces.length}</span> tỉnh cũ (+200 điểm)
              </p>
            </div>
          </div>

          {selectedProvinces.length > 0 && (
            <button
              id="btn-clear-selection"
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer"
              title="Xóa tất cả đang chọn"
            >
              <Trash2 size={16} />
              <span>Bỏ chọn</span>
            </button>
          )}
        </div>

        {/* Quick Province Picker Dropdown */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-sm font-black text-slate-700 mb-2">
            <PlusCircle size={16} className="text-edu-blue" />
            <span>Bấm trên bản đồ hoặc chọn nhanh tại đây:</span>
          </div>
          <select
            id="quick-select-province"
            defaultValue=""
            onChange={handleQuickAdd}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm sm:text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-edu-blue cursor-pointer"
          >
            <option value="" disabled>
              -- Bấm vào đây để chọn nhanh tỉnh thành --
            </option>
            {sortedProvinces.filter((p) => !completedGroupIds.includes(p.groupId)).length === 0 ? (
              <option value="" disabled>
                🎉 Em đã hoàn thành ghép tất cả các tỉnh mới!
              </option>
            ) : (
              sortedProvinces
                .filter((p) => !completedGroupIds.includes(p.groupId))
                .map((p) => {
                  const isSelected = selectedProvinceIds.includes(p.id);
                  return (
                    <option key={p.id} value={p.id} disabled={isSelected}>
                      {isSelected ? '✓ ' : ''}
                      {p.oldProvince} ({p.region})
                    </option>
                  );
                })
            )}
          </select>
        </div>

        {/* Selected List with Large, Friendly Cards */}
        <div className="space-y-2.5 max-h-[230px] overflow-y-auto pr-1 mb-4">
          {selectedProvinces.length === 0 ? (
            <div className="text-center py-7 px-4 rounded-3xl border-2 border-dashed border-blue-200/80 bg-blue-50/40">
              <HelpCircle size={36} className="mx-auto text-blue-400 mb-2" />
              <p className="text-base font-extrabold text-slate-800">Chưa có tỉnh nào được chọn</p>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Em hãy bấm chuột vào các tỉnh trên bản đồ để ghép nhóm (Ví dụ: bấm Hà Nội và Hà Tây)
              </p>
            </div>
          ) : (
            selectedProvinces.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 transition-all hover:bg-blue-100/70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-edu-blue text-white flex items-center justify-center font-black text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-800">{p.oldProvince}</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-500">{p.region}</div>
                  </div>
                </div>

                <button
                  onClick={() => removeProvince(p.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Xóa tỉnh này"
                >
                  <X size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Completed Groups Counter */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 mb-4">
          <div className="flex items-center justify-between text-sm font-black text-amber-900">
            <span className="flex items-center gap-2">
              <Award size={18} className="text-amber-600" />
              <span>Tỉnh mới đã ghép đúng:</span>
            </span>
            <span className="text-base font-black text-amber-700">
              {completedGroupIds.length}/{groups.length}
            </span>
          </div>
          {completedGroupIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {completedGroupIds.map((gid) => {
                const group = groups.find((g) => g.groupId === gid);
                return (
                  <span
                    key={gid}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg text-white shadow-2xs"
                    style={{ backgroundColor: group?.color || '#0284c7' }}
                  >
                    ✓ {group?.newProvince}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Large, Kid-Friendly Check Result Button */}
      <div className="pt-2">
        <button
          id="btn-check-result"
          onClick={checkCurrentSelection}
          disabled={selectedProvinces.length < 2}
          className={`w-full py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer min-h-[56px] ${
            selectedProvinces.length >= 2
              ? 'bg-gradient-to-r from-edu-blue via-indigo-600 to-edu-green hover:from-blue-600 hover:to-emerald-600 text-white shadow-blue-500/25 active:scale-98'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <CheckCircle2 size={22} />
          <span>Kiểm tra kết quả</span>
        </button>
        <p className="text-xs sm:text-sm text-center text-slate-500 font-bold mt-2">
          Bấm chọn từ 2 đến 3 tỉnh cũ trên bản đồ
        </p>
      </div>
    </div>
  );
};
