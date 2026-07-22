"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import DayModal from "./components/DayModal";
import HabitModal from "./components/HabitModal";

type Level = "completed" | "partial" | "missed";

interface HabitMeta {
  id: number;
  title: string;
  subtitle: string; // 백엔드의 content에 매핑
  icon?: string;    // 👈 아이콘 타입 추가!
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
const HISTORY_DAYS = 371;
const API_BASE_URL = "http://localhost:8080/habits";

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(anchor: Date) {
  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Habits() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const particleLayerRef = useRef<HTMLDivElement>(null);

  // 초기 상태
  const [habitsMeta, setHabitsMeta] = useState<HabitMeta[]>([]);
  const [histories, setHistories] = useState<Record<number, Record<string, Level>>>([]);
  
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [dayModalKey, setDayModalKey] = useState<string | null>(null);
  const [habitModalId, setHabitModalId] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const AVAILABLE_ICONS = ["🔥", "💧", "📚", "🏃", "🥦", "🧘", "🥑", "⏰", "💻", "✨"];
  const [selectedIcon, setSelectedIcon] = useState("🔥");

  // 날짜별 회고 상태
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({
    [todayKey]: "오늘도 한 걸음 나아가는 하루!",
  });

  // 1. 백엔드 전체 데이터 로드 (GET /habits)
  const fetchHabitsData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      
      const data = await res.json(); 
      
      const metaArray: HabitMeta[] = [];
      const historyMap: Record<number, Record<string, Level>> = {};

      data.forEach((habit: any) => {
        // 💡 [수정] 백엔드에서 받아온 habit.icon을 metaArray에 정확히 매핑해 줍니다!
        metaArray.push({
          id: habit.id,
          title: habit.title,
          subtitle: habit.content || "",
          icon: habit.icon || "🔥", 
        });

        const habitLogs: Record<string, Level> = {};
        if (habit.habitLogs) {
          habit.habitLogs.forEach((log: any) => {
            habitLogs[log.date] = log.status as Level;
          });
        }
        historyMap[habit.id] = habitLogs;
      });

      setHabitsMeta(metaArray);
      setHistories(historyMap);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsData();
  }, []);

  const getLevel = (habitId: number, dateKey: string): Level => histories[habitId]?.[dateKey] ?? "missed";

  const levelLabel = (level: Level) => (level === "completed" ? "완료" : level === "partial" ? "부분" : "미완료");

  const fireConfetti = (x: number, y: number) => {
    const layer = particleLayerRef.current;
    if (!layer) return;
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      Object.assign(particle.style, {
        position: "fixed", left: `${x}px`, top: `${y}px`, width: "6px", height: "6px",
        backgroundColor: "#d4805a", borderRadius: "50%", pointerEvents: "none", zIndex: "9999",
      });
      layer.appendChild(particle);
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      particle.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 },
      ], { duration: 600, easing: "cubic-bezier(0,.9,.57,1)" })
      .addEventListener("finish", () => particle.remove());
    }
  };

  const toggleCell = async (habitId: number, dateKey: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const current = getLevel(habitId, dateKey);
    const next: Level = current === "completed" ? "missed" : "completed";
    
    if (next === "completed") fireConfetti(e.clientX, e.clientY);

    setHistories((prev) => ({
      ...prev,
      [habitId]: { ...prev[habitId], [dateKey]: next }
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateKey, status: next }),
      });
      if (!res.ok) throw new Error("상태를 저장하지 못했습니다.");
    } catch (error) {
      console.error("Toggle Error:", error);
      setHistories((prev) => ({
        ...prev,
        [habitId]: { ...prev[habitId], [dateKey]: current }
      }));
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newSubtitle,
          days: 127,
          icon: selectedIcon, 
          color: "#c9a45f",
          time: "12:00:00"
        }),
      });

      if (!res.ok) throw new Error("습관 추가 실패");
      const createdHabit = await res.json();

      setHabitsMeta((prev) => [...prev, {
        id: createdHabit.id,
        title: createdHabit.title,
        subtitle: createdHabit.content || "",
        icon: createdHabit.icon || "🔥" 
      }]);
      
      setHistories((prev) => ({ ...prev, [createdHabit.id]: {} }));
      setNewTitle("");
      setNewSubtitle("");
      setSelectedIcon("🔥"); 
    } catch (error) {
      console.error(error);
    }
  };

  const getStreak = (habitId: number) => {
    let streak = 0;
    const cursor = new Date(today);
    while (getLevel(habitId, toDateKey(cursor)) === "completed") {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  const getCompletionRate = (habitId: number, days = 30) => {
    if (habitsMeta.length === 0) return 0;
    let done = 0;
    const cursor = new Date(today);
    for (let i = 0; i < days; i++) {
      if (getLevel(habitId, toDateKey(cursor)) === "completed") done++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return Math.round((done / days) * 100);
  };

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const weekLabel = `${weekDates[0].getMonth() + 1}월 ${weekDates[0].getDate()}일 - ${weekDates[6].getMonth() + 1}월 ${weekDates[6].getDate()}일`;

  const goPrevWeek = () => setWeekAnchor((p) => { const d = new Date(p); d.setDate(d.getDate() - 7); return d; });
  const goNextWeek = () => setWeekAnchor((p) => { const d = new Date(p); d.setDate(d.getDate() + 7); return d; });

  const yearCells = useMemo(() => {
    const cells: { dateKey: string; weekday: number }[] = [];
    for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      cells.push({ dateKey: toDateKey(d), weekday: d.getDay() });
    }
    const pad = cells[0].weekday;
    return Array(pad).fill(null).concat(cells);
  }, [today]);

  const weekChartData = useMemo(() => {
    return weekDates.map((d) => {
      const key = toDateKey(d);
      let completedCount = 0;
      let partialCount = 0;

      habitsMeta.forEach((h) => {
        const lvl = getLevel(h.id, key);
        if (lvl === "completed") completedCount++;
        else if (lvl === "partial") partialCount++;
      });

      const totalHabits = habitsMeta.length;
      const score = totalHabits > 0 ? ((completedCount + partialCount * 0.5) / totalHabits) * 100 : 0;

      return {
        dayName: WEEKDAYS_KO[d.getDay()],
        dateDisplay: `${d.getDate()}일`,
        completedCount,
        score: Math.round(score),
      };
    });
  }, [weekDates, habitsMeta, histories]);

  const summaryMetrics = useMemo(() => {
    if (habitsMeta.length === 0) return { todayRate: 0, bestHabit: "-", avgStreak: 0 };
    
    let todayDone = 0;
    let maxStreak = -1;
    let bestHabitTitle = "-";
    let totalStreak = 0;

    habitsMeta.forEach((h) => {
      if (getLevel(h.id, todayKey) === "completed") todayDone++;
      const streak = getStreak(h.id);
      totalStreak += streak;
      if (streak > maxStreak) {
        maxStreak = streak;
        bestHabitTitle = h.title;
      }
    });

    return {
      todayRate: Math.round((todayDone / habitsMeta.length) * 100),
      bestHabit: maxStreak > 0 ? `${bestHabitTitle} (${maxStreak}일)` : "-",
      avgStreak: Math.round(totalStreak / habitsMeta.length)
    };
  }, [habitsMeta, histories, todayKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fffdf9] text-[#775a1c] font-bold">
        습관 데이터를 동기화 중입니다...
      </div>
    );
  }

  return (
    <>
      <div ref={particleLayerRef} className="pointer-events-none fixed inset-0 z-[9999]" />

      <div className="max-w-[950px] mx-auto space-y-6 px-4 py-6">
        {/* 상단 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-[#201b14]">Habit Consistency</h2>
            <p className="text-sm text-[#867b6a] mt-0.5">원형 버튼을 누르면 습관 아이콘이 채워지며 완료됩니다.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#f4ead8] p-1 rounded-xl">
            <button onClick={goPrevWeek} className="w-8 h-8 flex items-center justify-center hover:bg-[#fffdf9] rounded-lg transition-colors text-[#775a1c] font-bold">
              &lt;
            </button>
            <span className="px-2 text-[13px] font-bold text-[#775a1c] whitespace-nowrap">{weekLabel}</span>
            <button onClick={goNextWeek} className="w-8 h-8 flex items-center justify-center hover:bg-[#fffdf9] rounded-lg transition-colors text-[#775a1c] font-bold">
              &gt;
            </button>
          </div>
        </div>

        {/* 메인 그리드 영역 */}
        <section className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-4 sm:p-6 shadow-[0_6px_22px_rgba(150,120,70,0.06)] overflow-x-auto">
          <div className="min-w-[650px] space-y-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-2 border-b border-[#eee4d3]/60 pb-2">
              <span className="text-[11px] font-bold text-[#9b8f7c] flex items-center pl-1.5">습관 분석 대시보드</span>
              {weekDates.map((d) => {
                const key = toDateKey(d);
                const isToday = key === todayKey;
                return (
                  <button
                    key={key}
                    onClick={() => setDayModalKey(key)}
                    className={`flex flex-col items-center py-1 rounded-lg transition-colors hover:bg-[#f4ead8] ${isToday ? "bg-[#f4ead8]" : ""}`}
                  >
                    <span className="text-[10px] font-bold text-[#9b8f7c]">{WEEKDAYS_KO[d.getDay()]}</span>
                    <span className={`text-[13px] font-bold ${isToday ? "text-[#775a1c]" : "text-[#201b14]"}`}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* 습관 리스트 & 원형 아이콘 체크박스 격자 */}
            <div className="space-y-2">
              {habitsMeta.map((habit) => (
                <div key={habit.id} className="grid grid-cols-[140px_repeat(7,1fr)] gap-2 items-center">
                  {/* 습관 상세 보기 버튼 */}
                  <button
                    onClick={() => setHabitModalId(habit.id)}
                    className="p-1.5 rounded-lg hover:bg-[#faf4e9] transition-colors text-left min-w-0 border border-transparent hover:border-[#eee4d3]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{habit.icon || "🔥"}</span>
                      <p className="text-[13px] font-bold text-[#201b14] truncate">{habit.title}</p>
                    </div>
                    <p className="text-[10px] text-[#9b8f7c] truncate pl-5">{habit.subtitle}</p>
                  </button>

                  {/* 💡 [수정] 원형 체크박스 UI: 클릭하면 완료 상태로 변경 및 아이콘 등장 */}
                  {weekDates.map((d) => {
                    const key = toDateKey(d);
                    const level = getLevel(habit.id, key);
                    
                    const cellStyle = () => {
                      switch (level) {
                        case "completed": return "bg-[#c9a45f]/15 border-[#c9a45f] text-white scale-100";
                        case "partial": return "bg-[#ece1d5]/40 border-[#c9a45f]/40 text-inherit";
                        case "missed": return "bg-[#fffdf9] border-[#eee4d3] hover:border-[#ece1d5] text-transparent";
                      }
                    };

                    return (
                      <button
                        key={key}
                        onClick={(e) => toggleCell(habit.id, key, e)}
                        title={`${key} · ${levelLabel(level)}`}
                        className={`aspect-square max-w-[38px] mx-auto w-full rounded-full flex items-center justify-center border-2 transition-all duration-200 active:scale-95 ${cellStyle()}`}
                      >
                        {level === "completed" && (
                          <span className="text-base animate-in fade-in pop-in duration-300">
                            {habit.icon || "🔥"}
                          </span>
                        )}
                        {level === "partial" && (
                          <div className="w-1.5 h-1.5 bg-[#867b6a] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 습관 추가 인라인 폼 */}
            <div className="pt-4 border-t border-[#eee4d3]/60">
              <div className="flex flex-col gap-2 bg-[#faf4e9]/50 p-3 rounded-xl border border-[#eee4d3]/40">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-[#9b8f7c] whitespace-nowrap">아이콘 선택:</span>
                  {AVAILABLE_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setSelectedIcon(ico)}
                      className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-all ${
                        selectedIcon === ico ? "bg-[#c9a45f] scale-110 shadow-sm text-white" : "bg-[#fffdf9] border border-[#eee4d3] hover:bg-[#f4ead8]"
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
                
                <form onSubmit={handleAddHabit} className="flex gap-2 w-full">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#fffdf9] border border-[#eee4d3] rounded-xl text-base shadow-inner">
                    {selectedIcon}
                  </span>
                  <input
                    type="text"
                    placeholder="습관 이름"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-[3] px-3 py-1.5 text-[12px] bg-[#fffdf9] border border-[#eee4d3] rounded-xl focus:outline-none focus:border-[#c9a45f] text-[#201b14] font-bold"
                    maxLength={15}
                  />
                  <input
                    type="text"
                    placeholder="상세 설명"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="flex-[5] px-3 py-1.5 text-[12px] bg-[#fffdf9] border border-[#eee4d3] rounded-xl focus:outline-none focus:border-[#c9a45f] text-[#201b14]"
                    maxLength={35}
                  />
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="flex-[2] py-1.5 bg-[#c9a45f] hover:bg-[#b59251] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-[12px] font-bold transition-all"
                  >
                    추가
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 통계 대시보드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-5 shadow-[0_6px_22px_rgba(150,120,70,0.06)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#201b14] mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-[#c9a45f] rounded-full inline-block"></span>
                오늘의 성취 요약
              </h3>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-[#867b6a]">오늘의 달성률</span>
                  <span className="text-[14px] font-bold text-[#c9a45f]">{summaryMetrics.todayRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-[#867b6a]">평균 스트릭</span>
                  <span className="text-[14px] font-bold text-[#201b14]">{summaryMetrics.avgStreak}일 연속</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-[#867b6a]">최고의 습관</span>
                  <span className="text-[12px] font-bold text-[#775a1c] max-w-[120px] truncate text-right">{summaryMetrics.bestHabit}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#eee4d3]/40 text-[10px] text-[#9b8f7c]">
              💡 상단 습관 타이틀을 누르면 대형 분석 모달이 열립니다.
            </div>
          </div>

          {/* 주간 성취도 그래프 */}
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-5 shadow-[0_6px_22px_rgba(150,120,70,0.06)] md:col-span-2">
            <h3 className="text-sm font-bold text-[#201b14] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-[#d4805a] rounded-full inline-block"></span>
              선택한 주간 성취율 그래프 (%)
            </h3>
            
            <div className="flex items-end justify-between h-32 pt-6 px-4 border-b border-[#eee4d3]/80 relative bg-[#faf6ee]/30 rounded-t-lg">
              <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-[#eee4d3]/40 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-[#eee4d3]/40 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-[#eee4d3]/40 pointer-events-none"></div>

              {weekChartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group relative z-10">
                  <div className="absolute -top-8 bg-[#201b14] text-white text-[10px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    성취도: {data.score}% ({data.completedCount}개 완료)
                  </div>
                  <div 
                    className="w-6 sm:w-8 bg-[#c9a45f] hover:bg-[#b59251] rounded-t-md transition-all duration-500 ease-out shadow-sm cursor-pointer"
                    style={{ height: `${Math.max(data.score, 6)}px` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-2 px-4">
              {weekChartData.map((data, idx) => (
                <div key={idx} className="flex-1 text-center flex flex-col">
                  <span className="text-[11px] font-bold text-[#201b14]">{data.dayName}</span>
                  <span className="text-[9px] text-[#9b8f7c]">{data.dateDisplay}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Day 모달 */}
      {dayModalKey && (
        <DayModal
          dayModalKey={dayModalKey}
          WEEKDAYS_KO={WEEKDAYS_KO}
          habitsMeta={habitsMeta}
          getLevel={getLevel}
          dayNotes={dayNotes}
          setDayNotes={setDayNotes}
          onClose={() => setDayModalKey(null)}
        />
      )}

      {/* Habit 상세 분석 모달 */}
      {habitModalId && (
        <HabitModal
          habitId={habitModalId}
          habitsMeta={habitsMeta}
          setHabitsMeta={setHabitsMeta}
          streak={getStreak(habitModalId)}
          rate={getCompletionRate(habitModalId)}
          yearCells={yearCells}
          getLevel={getLevel}
          onClose={() => setHabitModalId(null)}
        />
      )}
    </>
  );
}