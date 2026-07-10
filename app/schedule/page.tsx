// app/components/Schedule.tsx
"use client";

import React, { useRef, useState } from "react";

type Priority = "high" | "medium" | "low";
type TodoStatus = "pending" | "in-progress" | "completed";

interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
  priority?: Priority;
  due?: string;
  progress?: number; // 0~100, in-progress 항목용
}

const priorityStyle: Record<Priority, string> = {
  high: "bg-[#ffdad6] text-[#93000a]",
  medium: "bg-[#ffdbcd] text-[#360f00]",
  low: "bg-[#faf4e9] text-[#867b6a]",
};

const priorityLabel: Record<Priority, string> = {
  high: "높음",
  medium: "중간",
  low: "낮음",
};

const initialTodos: Todo[] = [
  { id: 1, title: "디자인 시스템 가이드 문서화", status: "pending", priority: "high", due: "내일" },
  { id: 2, title: "분기별 성과 보고서 작성", status: "pending", priority: "low" },
  { id: 3, title: "Lumina 모바일 반응형 검토", status: "in-progress", priority: "medium", progress: 66 },
  { id: 4, title: "이메일 편지함 정리", status: "completed" },
  { id: 5, title: "주간 식단 계획 수립", status: "completed" },
];

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

const timeline = [
  {
    time: "09:00",
    dotColor: "bg-[#775a1c]",
    title: "모닝 리서치 & 뉴스레터",
    tag: "WORK",
    tagBg: "bg-[#ffdea6]",
    tagColor: "text-[#271900]",
    desc: "업계 트렌드 분석 및 주요 소식 정리",
    current: false,
  },
  {
    time: "11:30",
    dotColor: "bg-[#924b29]",
    title: "Lumina UX 디자인 리뷰",
    tag: "MEETING",
    tagBg: "bg-[#ffdbcd]",
    tagColor: "text-[#743414]",
    desc: null,
    attendees: "외 2명 참여",
    current: false,
  },
  {
    time: "14:00",
    dotColor: "bg-[#775a1c]",
    title: "프로젝트 진행 상항 업데이트",
    tag: "진행 중",
    tagBg: "bg-[#775a1c]",
    tagColor: "text-white",
    desc: "개발팀과의 주간 동기화 세션",
    current: true,
  },
];

export default function Schedule() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodoText, setNewTodoText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const pending = todos.filter((t) => t.status === "pending");
  const inProgress = todos.filter((t) => t.status === "in-progress");
  const completed = todos.filter((t) => t.status === "completed");
  const completedCount = completed.length;
  const completionPercent = Math.round((completedCount / todos.length) * 100);

  const toggleComplete = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t
      )
    );
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    setTodos((prev) => [
      { id: Date.now(), title: newTodoText.trim(), status: "pending", priority: "low" },
      ...prev,
    ]);
    setNewTodoText("");
  };

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    scrollRef.current?.scrollBy({ top: e.deltaY, behavior: "smooth" });
  };

  return (
    <>
      {/* 페이지 전용 서브헤더 */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#201b14]">Schedule</h2>
          <p className="text-[13.5px] text-[#867b6a] mt-1">오늘의 일정과 할 일을 한눈에 확인하세요</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* 좌측 컬럼 (2/3) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-5">
          {/* 캘린더 카드 */}
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6 overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#201b14]">2024년 5월</h2>
                <p className="text-[#9b8f7c] text-[12.5px]">오늘의 일정을 확인하세요</p>
              </div>
              <div className="flex items-center gap-2 bg-[#f4ead8] p-1 rounded-xl">
                <button className="p-2 hover:bg-[#fffdf9] rounded-lg transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="px-4 py-1 bg-[#fffdf9] font-bold text-[14px] rounded-lg shadow-sm">오늘</button>
                <button className="p-2 hover:bg-[#fffdf9] rounded-lg transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#f0e8d9] rounded-xl border border-[#f0e8d9] overflow-hidden">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="bg-[#faf4e9] py-3 text-center text-[11px] font-bold text-[#867b6a] uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}

              {/* 이전 달 빈 칸 */}
              {[28, 29, 30].map((d) => (
                <div key={d} className="bg-[#fffdf9] p-3 min-h-[80px] sm:min-h-[100px] text-[#9b8f7c] text-[12.5px] opacity-40">
                  {d}
                </div>
              ))}

              {/* 1일 */}
              <div className="bg-[#fffdf9] p-3 min-h-[80px] sm:min-h-[100px] group hover:bg-[#f4ead8] transition-colors cursor-pointer">
                <span className="font-bold text-[#201b14]">1</span>
                <div className="mt-2 space-y-1">
                  <div className="bg-[#775a1c]/10 border-l-2 border-[#775a1c] px-2 py-0.5 rounded text-[10px] font-bold text-[#775a1c] truncate">
                    전략 기획 회의
                  </div>
                </div>
              </div>

              {[2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className="bg-[#fffdf9] p-3 min-h-[80px] sm:min-h-[100px] group hover:bg-[#f4ead8] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[#201b14]">{d}</span>
                </div>
              ))}

              {/* 6일 - 오늘 */}
              <div className="bg-[#f4ead8] p-3 min-h-[80px] sm:min-h-[100px] ring-2 ring-[#775a1c] ring-inset relative">
                <span className="font-bold text-[#775a1c]">6</span>
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#924b29] rounded-full" />
                <div className="mt-2 space-y-1">
                  <div className="bg-[#fda27a]/40 border-l-2 border-[#924b29] px-2 py-0.5 rounded text-[10px] font-bold text-[#924b29] truncate">
                    디자인 리뷰
                  </div>
                  <div className="bg-[#90b37b]/40 border-l-2 border-[#476737] px-2 py-0.5 rounded text-[10px] font-bold text-[#274519] truncate">
                    운동
                  </div>
                </div>
              </div>

              <div className="bg-[#fffdf9] p-3 min-h-[80px] sm:min-h-[100px] group hover:bg-[#f4ead8] transition-colors cursor-pointer">
                <span className="font-bold text-[#201b14]">7</span>
              </div>

              {[8, 9, 10, 11].map((d) => (
                <div key={d} className="bg-[#fffdf9] p-3 min-h-[80px] sm:min-h-[100px] text-[#201b14]">
                  {d}
                </div>
              ))}
            </div>
          </section>

          {/* 오늘의 타임라인 */}
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-[#201b14]">오늘의 타임라인</h3>
              <button className="text-[#775a1c] font-bold text-[13px] hover:underline">전체 보기</button>
            </div>

            <div className="relative space-y-6 before:absolute before:left-[47px] before:top-2 before:bottom-2 before:w-px before:bg-[#f0e8d9]">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 sm:gap-6 group">
                  <div className="w-10 sm:w-12 text-right">
                    <span className={`text-[11px] font-bold ${item.current ? "text-[#775a1c]" : "text-[#9b8f7c]"}`}>
                      {item.time}
                    </span>
                  </div>
                  <div
                    className={`relative z-10 flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${item.dotColor} ${
                      item.current ? "ring-4 ring-[#ffdea6]" : "ring-4 ring-[#fffdf9]"
                    }`}
                  />
                  <div
                    className={`flex-grow p-4 rounded-2xl transition-shadow border ${
                      item.current
                        ? "bg-[#775a1c]/5 border-[#775a1c]/20 shadow-sm"
                        : "bg-[#faf4e9] border-transparent hover:border-[#eee4d3] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <h4 className={`font-bold text-sm ${item.current ? "text-[#775a1c]" : "text-[#201b14]"}`}>
                        {item.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${item.tagBg} ${item.tagColor} ${
                          item.current ? "animate-pulse" : ""
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    {item.desc && (
                      <p className={`text-[12.5px] mt-1 ${item.current ? "text-[#775a1c]/80" : "text-[#867b6a]"}`}>
                        {item.desc}
                      </p>
                    )}
                    {item.attendees && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-[#fffdf9] bg-gray-200" />
                          <div className="w-6 h-6 rounded-full border border-[#fffdf9] bg-gray-300" />
                        </div>
                        <span className="text-[12.5px] text-[#9b8f7c]">{item.attendees}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 우측 컬럼 (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
          {/* 할 일 목록 */}
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] flex flex-col h-full min-h-[600px]">
            <div className="p-4 lg:p-6 border-b border-[#f0e8d9]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-[#201b14]">할 일 목록</h3>
                <button className="text-[#867b6a] hover:text-[#775a1c]">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
              <div className="relative">
                <input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="w-full bg-[#faf4e9] border-none rounded-xl py-3 pl-11 pr-4 text-[13.5px] focus:ring-2 focus:ring-[#775a1c]/20 outline-none"
                  placeholder="새로운 할 일 추가..."
                  type="text"
                />
                <button onClick={addTodo} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8f7c] hover:text-[#775a1c]">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>

            <div ref={scrollRef} onWheel={handleWheelScroll} className="flex-grow p-4 lg:p-6 overflow-y-auto space-y-8">
              {/* 대기 중 */}
              <div>
                <h4 className="text-[11px] font-bold text-[#9b8f7c] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9b8f7c]" /> 대기 중 ({pending.length})
                </h4>
                <div className="space-y-3">
                  {pending.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-3 p-3 bg-[#f4ead8]/50 rounded-xl hover:bg-[#f4ead8] transition-colors cursor-pointer"
                    >
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className="mt-1 w-5 h-5 rounded border border-[#7f7667] flex items-center justify-center hover:border-[#775a1c] shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">check</span>
                      </button>
                      <div className="flex-grow">
                        <p className="text-[13.5px] text-[#201b14]">{todo.title}</p>
                        <div className="flex gap-2 mt-2 items-center">
                          {todo.priority && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityStyle[todo.priority]}`}>
                              {priorityLabel[todo.priority]}
                            </span>
                          )}
                          {todo.due && (
                            <span className="flex items-center gap-1 text-[10px] text-[#9b8f7c]">
                              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                              {todo.due}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pending.length === 0 && <p className="text-[12.5px] text-[#9b8f7c]">대기 중인 항목이 없습니다.</p>}
                </div>
              </div>

              {/* 진행 중 */}
              <div>
                <h4 className="text-[11px] font-bold text-[#775a1c] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#775a1c]" /> 진행 중 ({inProgress.length})
                </h4>
                <div className="space-y-3">
                  {inProgress.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-3 p-4 bg-[#775a1c]/5 rounded-xl border border-[#775a1c]/10 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#775a1c]" />
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className="mt-1 w-5 h-5 rounded border border-[#775a1c] flex items-center justify-center text-[#775a1c] shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">check</span>
                      </button>
                      <div className="flex-grow">
                        <p className="font-bold text-[14px] text-[#201b14]">{todo.title}</p>
                        <div className="flex gap-2 mt-2 items-center">
                          {todo.priority && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityStyle[todo.priority]}`}>
                              {priorityLabel[todo.priority]}
                            </span>
                          )}
                        </div>
                        {typeof todo.progress === "number" && (
                          <div className="h-1 bg-[#775a1c]/10 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-[#775a1c]" style={{ width: `${todo.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {inProgress.length === 0 && <p className="text-[12.5px] text-[#9b8f7c]">진행 중인 항목이 없습니다.</p>}
                </div>
              </div>

              {/* 완료됨 */}
              <div className="opacity-60">
                <h4 className="text-[11px] font-bold text-[#476737] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#476737]" /> 완료됨 ({completed.length})
                </h4>
                <div className="space-y-3">
                  {completed.map((todo) => (
                    <div key={todo.id} className="group flex items-start gap-3 p-3 bg-[#faf4e9] rounded-xl">
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className="mt-1 w-5 h-5 rounded bg-[#476737] flex items-center justify-center text-white shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </button>
                      <div className="flex-grow">
                        <p className="text-[13.5px] text-[#867b6a] line-through">{todo.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6 border-t border-[#f0e8d9] bg-[#faf4e9]/30 rounded-b-[18px]">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-[#9b8f7c]">오늘 완료된 할 일: {completedCount}건</span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-1.5 bg-[#f4ead8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#476737]" style={{ width: `${completionPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#476737] ml-1">{completionPercent}%</span>
                </div>
              </div>
            </div>
          </section>

          {/* 생산성 하이라이트 카드 */}
          <div className="bg-gradient-to-br from-[#d4805a] to-[#c9a45f] rounded-[18px] p-4 lg:p-6 text-white flex items-center gap-4 shadow-lg shadow-[#775a1c]/10">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h4 className="font-bold text-[14px]">생산성 하이라이트</h4>
              <p className="text-[12px] opacity-90">이번 주 계획된 일정의 85%를 성공적으로 수행하고 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 추가 플로팅 버튼 */}
      <button
        onClick={addTodo}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#775a1c] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[60] group"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform">add</span>
      </button>
    </>
  );
}