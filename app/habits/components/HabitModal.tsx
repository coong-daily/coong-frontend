"use client";

import React, { useState, useEffect, useMemo } from "react";

type Level = "completed" | "partial" | "missed";

interface HabitMeta {
  id: number;
  title: string;
  subtitle: string;
  icon?: string;
}

interface HabitModalProps {
  habitId: number;
  habitsMeta: HabitMeta[];
  setHabitsMeta: React.Dispatch<React.SetStateAction<HabitMeta[]>>;
  streak: number;
  rate: number;
  yearCells: { dateKey: string; weekday: number }[] | any[];
  getLevel: (id: number, key: string) => Level;
  onClose: () => void;
}

export default function HabitModal({
  habitId,
  habitsMeta,
  setHabitsMeta,
  streak,
  rate,
  yearCells,
  getLevel,
  onClose,
}: HabitModalProps) {
  const habit = habitsMeta.find((h) => h.id === habitId);

  // ✏️ 원본 수정 기능을 위한 상태값 완벽 복구
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [titleVal, setTitleVal] = useState(habit?.title || "");
  const [subtitleVal, setSubtitleVal] = useState(habit?.subtitle || "");

  useEffect(() => {
    if (habit) {
      setTitleVal(habit.title);
      setSubtitleVal(habit.subtitle);
    }
  }, [habit]);

  // 📅 오늘 날짜와 무관하게 1월부터 12월까지 순차적으로 렌더링하기 위한 고정 고른 배열
  const MONTHS_KO = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  // 요일 세로 레이블
  const WEEKDAYS_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

  if (!habit) return null;

  const heatmapColor = (level: Level) => {
    switch (level) {
      case "completed": return "bg-[#c9a45f] border-[#b59251]";
      case "partial": return "bg-[#ece1d5] border-[#c9a45f]/30";
      case "missed": return "bg-[#faf6ee] border-[#eee4d3]/70 hover:bg-[#f4ead8]";
    }
  };

  // ✏️ 백엔드 연동 데이터 업데이트 로직 완벽 복구
  const handleUpdate = async () => {
    if (!titleVal.trim()) {
      setTitleVal(habit.title);
      return;
    }
    try {
      await fetch(`http://localhost:8080/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleVal, content: subtitleVal, icon: habit.icon || "🔥" }),
      });
      setHabitsMeta((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, title: titleVal, subtitle: subtitleVal } : h))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🗑️ 백엔드 연동 데이터 삭제 로직 완벽 복구
  const handleDelete = async () => {
    if (!window.confirm("이 습관의 모든 기록이 삭제됩니다. 삭제하시겠습니까?")) return;
    try {
      await fetch(`http://localhost:8080/habits/${habitId}`, { method: "DELETE" });
      setHabitsMeta((prev) => prev.filter((h) => h.id !== habitId));
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#201b14]/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* 💡 가로 크기를 여유롭게 넓힌 대형 모달 컨테이너 (max-w-4xl) */}
      <div className="bg-[#fffdf9] border border-[#eee4d3] w-full max-w-4xl rounded-[24px] p-6 md:p-8 shadow-[0_12px_40px_rgba(32,27,20,0.12)] space-y-6 flex flex-col max-h-[90vh] overflow-y-auto transform scale-100 transition-all">
        
        {/* 상단 헤더 및 인라인 수정 스크립트 구역 */}
        <div className="flex justify-between items-start gap-4 border-b border-[#eee4d3]/60 pb-4">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <span className="text-3xl p-2 bg-[#faf4e9] border border-[#eee4d3] rounded-2xl shadow-inner shrink-0">
              {habit.icon || "🔥"}
            </span>
            <div className="flex-1 min-w-0 space-y-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleVal}
                  onChange={(e) => setTitleVal(e.target.value)}
                  onBlur={() => { setIsEditingTitle(false); handleUpdate(); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setIsEditingTitle(false); handleUpdate(); } }}
                  className="text-lg font-bold text-[#201b14] bg-[#faf4e9] border border-[#c9a45f] rounded-lg px-2 py-0.5 w-full focus:outline-none"
                  autoFocus
                />
              ) : (
                <h3 onClick={() => setIsEditingTitle(true)} className="text-xl font-bold text-[#201b14] hover:bg-[#faf4e9] rounded px-1 cursor-pointer transition-colors truncate inline-block group">
                  {titleVal} <span className="text-xs font-normal text-[#9b8f7c] opacity-60 group-hover:opacity-100 ml-1">✏️</span>
                </h3>
              )}
              
              {isEditingSubtitle ? (
                <input
                  type="text"
                  value={subtitleVal}
                  onChange={(e) => setSubtitleVal(e.target.value)}
                  onBlur={() => { setIsEditingSubtitle(false); handleUpdate(); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setIsEditingSubtitle(false); handleUpdate(); } }}
                  className="text-sm text-[#867b6a] bg-[#faf4e9] border border-[#c9a45f] rounded-lg px-2 py-0.5 w-full focus:outline-none mt-1"
                  autoFocus
                />
              ) : (
                <p onClick={() => setIsEditingSubtitle(true)} className="text-sm text-[#867b6a] hover:bg-[#faf4e9] rounded px-1 cursor-pointer transition-colors truncate mt-0.5 block">
                  {subtitleVal || "설명이 없습니다. 클릭하여 추가하세요."}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-[#9b8f7c] hover:text-[#201b14] font-bold text-2xl p-1 transition-colors">✕</button>
        </div>

        {/* 대시보드 스탯 요약 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#faf4e9]/60 p-4 rounded-xl border border-[#eee4d3]/40 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-xs text-[#867b6a] font-medium">현재 연속 스트릭</p>
              <p className="text-xl font-bold text-[#c9a45f] mt-1">{streak}일 연속 달성 중</p>
            </div>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="bg-[#faf4e9]/60 p-4 rounded-xl border border-[#eee4d3]/40 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-xs text-[#867b6a] font-medium">최근 30일 달성률</p>
              <p className="text-xl font-bold text-[#775a1c] mt-1">{rate}%</p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </div>

        {/* 💡 시각적으로 풍부해지고 아래쪽 정렬이 강화된 히트맵 구역 */}
        <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-2xl p-5 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-[#201b14] flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-[#c9a45f] rounded-full inline-block"></span>
              연간 잔디 달성 추이 (최근 371일)
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-[#9b8f7c]">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-[#faf6ee] border border-[#eee4d3]/70" />
              <div className="w-2.5 h-2.5 rounded bg-[#ece1d5] border border-[#c9a45f]/30" />
              <div className="w-2.5 h-2.5 rounded bg-[#c9a45f]" />
              <span>More</span>
            </div>
          </div>

          <div className="w-full relative select-none">
            {/* 💡 고정형 1월 ~ 12월 순차 배열 상단 레이블 바 */}
            <div className="grid grid-cols-12 gap-1 pl-7 pr-1 mb-2.5 text-center text-[11px] font-bold text-[#9b8f7c] border-b border-[#eee4d3]/30 pb-1">
              {MONTHS_KO.map((month) => (
                <div key={month} className="truncate">
                  {month}
                </div>
              ))}
            </div>

            {/* 💡 세로/가로 크기를 넓혀 시원하게 하단 정렬을 유도한 그리드 본체 */}
            <div className="flex gap-2">
              {/* 요일 가이드 칼럼 */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-[#9b8f7c] pt-1 pb-1 h-[125px] shrink-0">
                {WEEKDAYS_SHORT.map((day, i) => (
                  <span key={i} className={i % 2 === 0 ? "text-[#9b8f7c]" : "opacity-30"}>
                    {day}
                  </span>
                ))}
              </div>

              {/* 53열 잔디 밭 */}
              <div className="grid grid-flow-col grid-rows-7 gap-[3.5px] flex-1 h-[125px] min-w-[650px] overflow-x-auto">
                {yearCells.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} className="bg-transparent" />;
                  const level = getLevel(habitId, cell.dateKey);
                  return (
                    <div
                      key={cell.dateKey}
                      title={`${cell.dateKey} : ${level === "completed" ? "완료" : level === "partial" ? "부분" : "미완료"}`}
                      className={`w-full aspect-square rounded-[3px] border transition-colors cursor-pointer ${heatmapColor(level)}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 모달 하단 제어 제어바 */}
        <div className="border-t border-[#eee4d3]/60 pt-4 flex justify-between items-center">
          <button 
            onClick={handleDelete} 
            className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            습관 삭제
          </button>
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-[#201b14] hover:bg-[#383025] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}