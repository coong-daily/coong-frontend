"use client";

import React, { useEffect, useRef, useState } from "react";

interface Habit {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  streakBars: boolean[]; // 최근 4일 완료 여부
  completed: boolean; // 오늘 완료 여부
}

interface HeatmapCell {
  level: "completed" | "partial" | "missed";
  tooltip: string;
}

const initialHabits: Habit[] = [
  {
    id: 1,
    title: "Hydrate (2.5L)",
    subtitle: "Streak: 14 days",
    icon: "water_drop",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    streakBars: [true, true, true, false],
    completed: false,
  },
  {
    id: 2,
    title: "Reading (30m)",
    subtitle: "Streak: 8 days",
    icon: "menu_book",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    streakBars: [true, false, false, false],
    completed: true,
  },
  {
    id: 3,
    title: "Movement",
    subtitle: "Streak: 32 days",
    icon: "fitness_center",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    streakBars: [true, true, true, true],
    completed: false,
  },
  {
    id: 4,
    title: "Meditation",
    subtitle: "Streak: 0 days",
    icon: "self_improvement",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    streakBars: [false, false, false, false],
    completed: false,
  },
];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [view, setView] = useState<"grid" | "trends">("grid");
  const particleLayerRef = useRef<HTMLDivElement>(null);

  // 히트맵은 클라이언트에서만 생성 (SSR 하이드레이션 불일치 방지)
  useEffect(() => {
    const totalCells = 84; // 12주 * 7일
    const cells: HeatmapCell[] = Array.from({ length: totalCells }, (_, i) => {
      const rand = Math.random();
      const intensity = Math.floor(Math.random() * 5);
      const level: HeatmapCell["level"] = rand > 0.6 ? "completed" : rand > 0.3 ? "partial" : "missed";
      return { level, tooltip: `Day ${i + 1}: ${intensity} Habits Done` };
    });
    setHeatmap(cells);
  }, []);

  const heatmapColor = (level: HeatmapCell["level"]) => {
    switch (level) {
      case "completed":
        return "bg-[#c9a45f]";
      case "partial":
        return "bg-[#ece1d5]";
      case "missed":
        return "bg-[#faf4e9]";
    }
  };

  const fireConfetti = (x: number, y: number) => {
    const layer = particleLayerRef.current;
    if (!layer) return;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.style.position = "fixed";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = "6px";
      particle.style.height = "6px";
      particle.style.backgroundColor = "#d4805a";
      particle.style.borderRadius = "50%";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "9999";
      layer.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist;

      particle
        .animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 },
          ],
          { duration: 600, easing: "cubic-bezier(0, .9, .57, 1)" }
        )
        .addEventListener("finish", () => particle.remove());
    }
  };

  const toggleHabit = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const nextCompleted = !habit.completed;
        if (nextCompleted) {
          fireConfetti(e.clientX, e.clientY);
        }
        return { ...habit, completed: nextCompleted };
      })
    );
  };

  const activeCount = habits.length;

  return (
    <>
      {/* 파티클(컨페티) 레이어 - 화면 전체에 절대 위치 */}
      <div ref={particleLayerRef} className="pointer-events-none fixed inset-0 z-[9999]" />

      <div className="max-w-[1200px] mx-auto space-y-5">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#201b14]">Habit Consistency</h2>
            <p className="text-sm sm:text-[13.5px] text-[#867b6a] mt-1">Your 12-week ritual momentum</p>
          </div>
          <div className="flex gap-2 bg-[#f4ead8] p-1 rounded-xl">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-1.5 font-bold text-[14px] rounded-lg transition-colors ${
                view === "grid" ? "bg-[#fffdf9] text-[#775a1c] shadow-sm" : "text-[#867b6a] hover:bg-[#fffdf9]/50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("trends")}
              className={`px-4 py-1.5 font-bold text-[14px] rounded-lg transition-colors ${
                view === "trends" ? "bg-[#fffdf9] text-[#775a1c] shadow-sm" : "text-[#867b6a] hover:bg-[#fffdf9]/50"
              }`}
            >
              Trends
            </button>
          </div>
        </div>

        {/* 히트맵 섹션 */}
        <section className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-4 lg:p-6 shadow-[0_6px_22px_rgba(150,120,70,0.06)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#c9a45f]" />
                <span className="text-[11px] font-bold text-[#867b6a] uppercase tracking-wider">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ece1d5]" />
                <span className="text-[11px] font-bold text-[#867b6a] uppercase tracking-wider">Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#faf4e9]" />
                <span className="text-[11px] font-bold text-[#867b6a] uppercase tracking-wider">Missed</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#9b8f7c] text-[12.5px]">
              <span>Jan</span>
              <span>—</span>
              <span>Mar 2024</span>
            </div>
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-2">
            {heatmap.map((cell, idx) => (
              <div
                key={idx}
                title={cell.tooltip}
                className={`aspect-square rounded-md transition-all duration-200 hover:scale-[1.15] hover:z-10 cursor-pointer ${heatmapColor(
                  cell.level
                )}`}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-between px-2 text-[#9b8f7c] text-[12.5px]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </section>

        {/* 하단 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 일일 습관 리스트 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-4 lg:p-6 shadow-[0_6px_22px_rgba(150,120,70,0.06)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-bold text-[#201b14]">Daily Rituals</h3>
                <span className="text-[11px] font-bold bg-[#f4ead8] text-[#775a1c] px-3 py-1 rounded-full">
                  {activeCount} Active
                </span>
              </div>

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 bg-[#faf4e9] rounded-xl group hover:bg-[#fef2e6] transition-colors border border-transparent hover:border-[#f0e8d9]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${habit.iconBg} ${habit.iconColor}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {habit.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#201b14]">{habit.title}</h4>
                        <p className="text-[12.5px] text-[#9b8f7c]">{habit.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-1">
                        {habit.streakBars.map((filled, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-6 rounded-full ml-1 first:ml-0 ${filled ? "bg-[#c9a45f]" : "bg-[#ece1d5]"}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={(e) => toggleHabit(habit.id, e)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          habit.completed
                            ? "bg-[#c9a45f] border-[#c9a45f] text-white shadow-sm"
                            : "border-[#f0e8d9] text-[#9b8f7c] hover:border-[#c9a45f] hover:text-[#775a1c]"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: habit.completed ? "'wght' 700" : "'wght' 400" }}
                        >
                          check
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 컬럼: 성취 요약 */}
          <div className="space-y-5">
            {/* 주간 성취 카드 */}
            <div className="bg-[#924b29] text-white rounded-[18px] p-4 lg:p-6 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#fda27a] opacity-20 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
              <div className="relative z-10">
                <span className="text-[11px] opacity-80 uppercase tracking-widest mb-4 block font-bold">
                  This Week&apos;s Win
                </span>
                <h3 className="text-[28px] font-bold leading-tight mb-2">Resilient Flow</h3>
                <p className="text-[13.5px] opacity-90 mb-6 leading-relaxed">
                  You&apos;ve hit 88% of your core rituals this week. Your consistency is in the top 5% of Lumina users.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[12.5px] mb-1">
                      <span>Target: 25 Habits</span>
                      <span>22 Achieved</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full">
                      <div className="h-full bg-white rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        military_tech
                      </span>
                    </div>
                    <p className="text-[14px] font-bold">Mastery Badge Unlocked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 분위기 카드 */}
            <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] p-4 lg:p-6 shadow-[0_6px_22px_rgba(150,120,70,0.06)]">
              <h3 className="text-[15px] font-bold text-[#201b14] mb-4">Focus Environment</h3>
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4">
                <img
                  className="w-full h-full object-cover"
                  alt="물방울이 맺힌 초록 잎을 클로즈업한 사진"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvvP7FF0sGdNHB9z7QsY1W0qid1lsG1RJJAMKTGsPMMe_Erwj61Nb1MONFWQXPn_HxqmCa7re9S3CBOZlGBq3t7CqVIGmaQxmRgmlILLziqaf2m3AG5rHEi5DUsZjnqpN5kJU4CmlcaCf1ly1bf1XGcopytFaJi3XtakR6egi2BksCRzCJZJbQcYD1PhCP-XUye03WwX2r36Ro_1_R1TzwMDaBckpsjlFfbdazuSvlwXvenBJJ9KlMPKDVZkn0Oc6r2AtftZsD3fjw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <p className="text-white text-[14px] font-bold">
                    &quot;The way you spend your days is the way you spend your life.&quot;
                  </p>
                  <p className="text-white/70 text-[12.5px] mt-1">— Annie Dillard</p>
                </div>
              </div>
              <button className="w-full py-2.5 border border-[#f0e8d9] rounded-xl text-[14px] font-bold text-[#867b6a] hover:bg-[#faf4e9] transition-colors">
                View Moodboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 습관 추가 FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-[#e7b48a] to-[#d4805a] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
}