"use client";

import React from "react";

type Level = "completed" | "partial" | "missed";

interface HabitMeta {
  id: number;
  title: string;
  subtitle: string;
}

interface DayModalProps {
  dayModalKey: string;
  WEEKDAYS_KO: string[];
  habitsMeta: HabitMeta[];
  getLevel: (habitId: number, dateKey: string) => Level;
  dayNotes: Record<string, string>;
  setDayNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClose: () => void;
}

export default function DayModal({
  dayModalKey,
  WEEKDAYS_KO,
  habitsMeta,
  getLevel,
  dayNotes,
  setDayNotes,
  onClose,
}: DayModalProps) {
  const date = new Date(dayModalKey);
  const dayLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS_KO[date.getDay()]}요일)`;

  // 당일의 통계 가공
  let doneCount = 0;
  let partialCount = 0;
  habitsMeta.forEach((h) => {
    if (getLevel(h.id, dayModalKey) === "completed") doneCount++;
    if (getLevel(h.id, dayModalKey) === "partial") partialCount++;
  });
  const totalCount = habitsMeta.length;
  const dayRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf9] rounded-[24px] w-full max-w-xl p-6 sm:p-8 shadow-2xl transition-all border border-[#eee4d3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6 border-b border-[#eee4d3] pb-4">
          <div>
            <span className="text-[11px] font-bold bg-[#c9a45f]/20 text-[#775a1c] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Daily Analytics
            </span>
            <h3 className="text-xl font-bold text-[#201b14] mt-2">{dayLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#faf4e9] text-[#9b8f7c] hover:text-[#201b14] font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* 1. 스코어보드 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#faf4e9] rounded-xl p-4 text-center">
              <p className="text-[10px] text-[#9b8f7c] font-bold">총 습관 수</p>
              <p className="text-xl font-bold text-[#201b14] mt-1">{totalCount}개</p>
            </div>
            <div className="bg-[#c9a45f]/10 rounded-xl p-4 text-center">
              <p className="text-[10px] text-[#775a1c] font-bold">완전 달성</p>
              <p className="text-xl font-bold text-[#c9a45f] mt-1">{doneCount}개</p>
            </div>
            <div className="bg-[#201b14]/5 rounded-xl p-4 text-center">
              <p className="text-[10px] text-[#867b6a] font-bold">당일 성취도 점수</p>
              <p className="text-xl font-bold text-[#201b14] mt-1">{dayRate}점</p>
            </div>
          </div>

          {/* 2. 진행률 바 */}
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-xl p-4">
            <div className="flex justify-between items-center text-[12px] mb-1.5 font-bold">
              <span className="text-[#201b14]">하루 목표 달성 상태</span>
              <span className="text-[#c9a45f]">{dayRate}% 완료</span>
            </div>
            <div className="w-full bg-[#faf4e9] h-3 rounded-full overflow-hidden border border-[#eee4d3]/60">
              <div
                className="bg-[#c9a45f] h-full transition-all duration-500"
                style={{ width: `${dayRate}%` }}
              ></div>
            </div>
          </div>

          {/* 3. 회고록 입력란 */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#201b14] block">
              📝 해당 날짜의 습관 수행 다이어리
            </label>
            <textarea
              value={dayNotes[dayModalKey] || ""}
              onChange={(e) => setDayNotes({ ...dayNotes, [dayModalKey]: e.target.value })}
              placeholder="이날 습관을 진행하면서 느꼈던 점이나 피드백을 자유롭게 기록하세요..."
              className="w-full h-24 p-3 text-[13px] bg-[#faf4e9] border border-[#eee4d3] rounded-xl focus:outline-none focus:border-[#c9a45f] text-[#201b14] resize-none placeholder-[#9b8f7c]"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#eee4d3]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#201b14] text-white font-bold text-[13px] rounded-xl hover:bg-black transition-colors"
          >
            기록 저장 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}