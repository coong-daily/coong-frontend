"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AddPlanModal from "./components/AddPlanModal";
import AddTodoModal from "./components/AddTodoModal";
import ConfirmModal from "../assets/components/ConfirmModal";
import QuickAddTodoBar from "./components/QuickAddTodoBar";

interface Plan {
  id: number;
  title: string;
  content: string | null;
  repeatType: string | null;
  repeatDays: string | null;
  startDate: string;
  endDate: string;
  color: string | null;
  categoryId: number | null;
  categoryName: string | null;
}

interface TodoItem {
  id: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  progress: number | null;
  categoryId: number | null;
  categoryName: string | null;
}

const priorityStyle: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "bg-[#ffdad6] text-[#93000a]",
  MEDIUM: "bg-[#ffdbcd] text-[#360f00]",
  LOW: "bg-[#faf4e9] text-[#867b6a]",
};

const priorityLabel: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

const API_BASE = "http://localhost:8080";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; dateKey: string; date: Date }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const d = new Date(year, month - 1, day);
    cells.push({ day, currentMonth: false, dateKey: toDateKey(d), date: d });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ day, currentMonth: true, dateKey: toDateKey(d), date: d });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const need = 7 - remainder;
    for (let day = 1; day <= need; day++) {
      const d = new Date(year, month + 1, day);
      cells.push({ day, currentMonth: false, dateKey: toDateKey(d), date: d });
    }
  }

  return cells;
}

function formatTime(isoString: string) {
  const timePart = isoString.split("T")[1];
  return timePart ? timePart.slice(0, 5) : "";
}

function expandPlanToDateKeys(plan: Plan, rangeStartKey: string, rangeEndKey: string): string[] {
  const start = plan.startDate.split("T")[0];
  const end = plan.endDate.split("T")[0];

  const clampedStart = start < rangeStartKey ? rangeStartKey : start;
  const clampedEnd = end > rangeEndKey ? rangeEndKey : end;

  const keys: string[] = [];
  const cursor = new Date(clampedStart);
  const last = new Date(clampedEnd);
  while (toDateKey(cursor) <= toDateKey(last)) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export default function Schedule() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; categoryName: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [deleteTodoTargetId, setDeleteTodoTargetId] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [viewDate, setViewDate] = useState<{ year: number; month: number }>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const monthCells = useMemo(() => getMonthMatrix(viewDate.year, viewDate.month), [viewDate]);
  const monthLabel = `${viewDate.year}년 ${viewDate.month + 1}월`;

  const rangeStartKey = monthCells[0].dateKey;
  const rangeEndKey = monthCells[monthCells.length - 1].dateKey;

  const [monthPlans, setMonthPlans] = useState<Plan[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const fetchMonthPlans = () => {
    setIsLoadingMonth(true);
    return fetch(`${API_BASE}/schedule/plans?startDate=${rangeStartKey}&endDate=${rangeEndKey}`)
      .then((res) => {
        if (!res.ok) throw new Error("월간 일정을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: Plan[]) => setMonthPlans(data))
      .catch((err) => console.error("월간 일정 조회 실패:", err))
      .finally(() => setIsLoadingMonth(false));
  };

  const fetchTodos = () => {
    setIsLoadingTodos(true);
    return fetch(`${API_BASE}/schedule/todos`)
      .then((res) => {
        if (!res.ok) throw new Error("할 일 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: TodoItem[]) => setTodos(data))
      .catch((err) => console.error("할 일 목록 조회 실패:", err))
      .finally(() => setIsLoadingTodos(false));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingMonth(true);

    fetch(`${API_BASE}/schedule/plans?startDate=${rangeStartKey}&endDate=${rangeEndKey}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("월간 일정을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: Plan[]) => setMonthPlans(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("월간 일정 조회 실패:", err);
        }
      })
      .finally(() => setIsLoadingMonth(false));

    return () => controller.abort();
  }, [rangeStartKey, rangeEndKey]);

  useEffect(() => {
    fetch(`${API_BASE}/schedule/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("일정 카테고리를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => setCategoryOptions(data))
      .catch((err) => console.error("일정 카테고리 로드 실패:", err));
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Plan[]> = {};
    monthPlans.forEach((plan) => {
      const keys = expandPlanToDateKeys(plan, rangeStartKey, rangeEndKey);
      keys.forEach((key) => {
        if (!map[key]) map[key] = [];
        map[key].push(plan);
      });
    });

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.startDate.localeCompare(b.startDate));
    });

    return map;
  }, [monthPlans, rangeStartKey, rangeEndKey]);

  const selectedDatePlans = eventsByDate[selectedDateKey] ?? [];

  // 선택한 날짜가 "등록일 ~ 마감일" 범위 안에 있는 할 일만 추출
  // 마감일이 없으면 등록일 당일에만 표시
  const selectedDateTodos = useMemo(() => {
    return todos.filter((todo) => {
      const start = todo.createdAt;
      const end = todo.dueDate ?? todo.createdAt;
      return selectedDateKey >= start && selectedDateKey <= end;
    });
  }, [todos, selectedDateKey]);

  const goPrevMonth = () => {
    setViewDate((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
  };

  const goNextMonth = () => {
    setViewDate((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
  };

  const goToday = () => {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDateKey(todayKey);
  };

  const handleAddPlan = async (input: {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    color: string;
    categoryId: number | null;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/schedule/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("일정 추가에 실패했습니다.");

      await fetchMonthPlans();
      setIsAddPlanOpen(false);
    } catch (err) {
      console.error("일정 추가 실패:", err);
      alert("일정 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleUpdatePlan = async (input: {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    color: string;
    categoryId: number | null;
  }) => {
    if (!editingPlan) return;
    try {
      const res = await fetch(`${API_BASE}/schedule/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("일정 수정에 실패했습니다.");

      await fetchMonthPlans();
      setEditingPlan(null);
    } catch (err) {
      console.error("일정 수정 실패:", err);
      alert("일정 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/schedule/plans/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("일정 삭제에 실패했습니다.");

      await fetchMonthPlans();
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const pending = selectedDateTodos.filter((t) => t.status === "PENDING");
  const inProgress = selectedDateTodos.filter((t) => t.status === "IN_PROGRESS");
  const completed = selectedDateTodos.filter((t) => t.status === "COMPLETED");
  const completedCount = completed.length;
  const completionPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  // 대기 중 <-> 완료 토글 (체크박스 클릭)
  const toggleComplete = async (todo: TodoItem) => {
    const nextStatus = todo.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch(`${API_BASE}/schedule/todos/${todo.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("할 일 상태 변경에 실패했습니다.");
      const updated: TodoItem = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("할 일 상태 변경 실패:", err);
    }
  };

  const addTodo = async (input: {
    title: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    dueDate: string | null;
    categoryId: number | null;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/schedule/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          status: "PENDING",
          priority: input.priority,
          dueDate: input.dueDate,
          categoryId: input.categoryId,
        }),
      });
      if (!res.ok) throw new Error("할 일 추가에 실패했습니다.");

      const created: TodoItem = await res.json();
      setTodos((prev) => [...prev, created]);
      setIsAddTodoOpen(false);
    } catch (err) {
      console.error("할 일 추가 실패:", err);
      alert("할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const updateTodo = async (
    id: number,
    input: {
      title: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      dueDate: string | null;
      categoryId: number | null;
    }
  ) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    try {
      const res = await fetch(`${API_BASE}/schedule/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          status: target.status, // 상태는 유지 (수정 모달에서 안 건드림)
          priority: input.priority,
          dueDate: input.dueDate,
          categoryId: input.categoryId,
        }),
      });
      if (!res.ok) throw new Error("할 일 수정에 실패했습니다.");

      const updated: TodoItem = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTodo(null);
    } catch (err) {
      console.error("할 일 수정 실패:", err);
      alert("할 일 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/schedule/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("할 일 삭제에 실패했습니다.");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("할 일 삭제 실패:", err);
    }
  };

  const confirmDeleteTodo = () => {
    if (deleteTodoTargetId !== null) {
      deleteTodo(deleteTodoTargetId);
      setDeleteTodoTargetId(null);
    }
  };  

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    scrollRef.current?.scrollBy({ top: e.deltaY, behavior: "smooth" });
  };

  const selectedDateLabel = useMemo(() => {
    const [, m, d] = selectedDateKey.split("-");
    return `${Number(m)}월 ${Number(d)}일`;
  }, [selectedDateKey]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#201b14]">Schedule</h2>
          <p className="text-[13.5px] text-[#867b6a] mt-1">오늘의 일정과 할 일을 한눈에 확인하세요</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-2/3 flex flex-col gap-5">
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6 overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#201b14]">{monthLabel}</h2>
                <p className="text-[#9b8f7c] text-[12.5px]">
                  {isLoadingMonth ? "일정을 불러오는 중..." : "날짜를 선택하면 해당일의 일정을 확인할 수 있어요"}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#f4ead8] p-1 rounded-xl">
                <button onClick={goPrevMonth} className="p-2 hover:bg-[#fffdf9] rounded-lg transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={goToday}
                  className="px-4 py-1 bg-[#fffdf9] font-bold text-[14px] rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  오늘
                </button>
                <button onClick={goNextMonth} className="p-2 hover:bg-[#fffdf9] rounded-lg transition-colors">
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

              {monthCells.map((cell) => {
                const isToday = cell.dateKey === todayKey;
                const isSelected = cell.dateKey === selectedDateKey;
                const dayPlans = eventsByDate[cell.dateKey] ?? [];
                const visiblePlans = dayPlans.slice(0, 2);
                const hiddenCount = dayPlans.length - visiblePlans.length;

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={`p-3 min-h-[90px] sm:min-h-[110px] relative cursor-pointer transition-colors ${
                      cell.currentMonth ? "bg-[#fffdf9]" : "bg-[#fffdf9] opacity-40"
                    } ${
                      isSelected ? "bg-[#f4ead8] ring-2 ring-[#775a1c] ring-inset" : "hover:bg-[#f4ead8]"
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        isToday ? "text-[#775a1c]" : cell.currentMonth ? "text-[#201b14]" : "text-[#9b8f7c]"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {isToday && <span className="absolute top-3 right-3 w-2 h-2 bg-[#924b29] rounded-full" />}

                    {visiblePlans.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {visiblePlans.map((plan) => (
                          <div
                            key={plan.id}
                            className="px-2 py-0.5 rounded text-[10px] font-bold truncate text-white"
                            style={{ backgroundColor: plan.color || "#775a1c" }}
                            title={plan.title}
                          >
                            {plan.title}
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <div className="text-[10px] text-[#9b8f7c] font-bold px-1">+{hiddenCount}개</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 선택한 날짜의 일정 */}
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-[#201b14]">{selectedDateLabel}의 일정</h3>
              <div className="flex items-center gap-3">
                <span className="text-[12.5px] text-[#9b8f7c]">{selectedDatePlans.length}건</span>
                <button
                  onClick={() => setIsAddPlanOpen(true)}
                  className="px-3 py-1.5 bg-[#775a1c] text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:brightness-110 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  일정 추가
                </button>
              </div>
            </div>

            {isLoadingMonth ? (
              <p className="text-sm text-[#9b8f7c] text-center py-8">불러오는 중...</p>
            ) : selectedDatePlans.length === 0 ? (
              <p className="text-sm text-[#9b8f7c] text-center py-8">해당 날짜에 등록된 일정이 없습니다.</p>
            ) : (
              <div className="relative space-y-6 before:absolute before:left-[47px] before:top-2 before:bottom-2 before:w-px before:bg-[#f0e8d9]">
                {selectedDatePlans.map((plan) => {
                  const dotColor = plan.color || "#775a1c";
                  return (
                    <div key={plan.id} className="flex items-start gap-4 sm:gap-6 group">
                      <div className="w-10 sm:w-12 text-right">
                        <span className="text-[11px] font-bold text-[#9b8f7c]">
                          {formatTime(plan.startDate)}
                        </span>
                      </div>
                      <div
                        className="relative z-10 flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ring-4 ring-[#fffdf9]"
                        style={{ backgroundColor: dotColor }}
                      />
                      <div className="flex-grow p-4 rounded-2xl bg-[#faf4e9] border border-transparent hover:border-[#eee4d3] hover:shadow-sm transition-shadow">
                        <div className="flex justify-between gap-2">
                          <h4 className="font-bold text-sm text-[#201b14]">{plan.title}</h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {plan.categoryName && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap text-white"
                                style={{ backgroundColor: dotColor }}
                              >
                                {plan.categoryName}
                              </span>
                            )}
                            <button
                              onClick={() => setEditingPlan(plan)}
                              className="p-1 rounded-md text-[#9b8f7c] hover:bg-[#f0e8d9] hover:text-[#775a1c] transition-colors opacity-0 group-hover:opacity-100"
                              title="수정"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(plan.id)}
                              className="p-1 rounded-md text-[#9b8f7c] hover:bg-[#ffcdd2] hover:text-[#c62828] transition-colors opacity-0 group-hover:opacity-100"
                              title="삭제"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                        {plan.content && (
                          <p className="text-[12.5px] mt-1 text-[#867b6a]">{plan.content}</p>
                        )}
                        <p className="text-[11px] text-[#9b8f7c] mt-2">
                          {formatTime(plan.startDate)} - {formatTime(plan.endDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {isAddPlanOpen && (
          <AddPlanModal
            defaultDate={selectedDateKey}
            categoryOptions={categoryOptions}
            onClose={() => setIsAddPlanOpen(false)}
            onAdd={handleAddPlan}
          />
        )}

        {editingPlan && (
          <AddPlanModal
            defaultDate={selectedDateKey}
            plan={editingPlan}
            categoryOptions={categoryOptions}
            onClose={() => setEditingPlan(null)}
            onAdd={handleUpdatePlan}
          />
        )}

        <ConfirmModal
          isOpen={deleteTargetId !== null}
          title="일정 삭제"
          message="이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제하기"
          cancelText="취소"
          variant="danger"
          onConfirm={() => {
            if (deleteTargetId !== null) {
              handleDeletePlan(deleteTargetId);
            }
          }}
          onClose={() => setDeleteTargetId(null)}
        />

        <ConfirmModal
          isOpen={deleteTodoTargetId !== null}
          title="할 일 삭제"
          message="이 할 일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제하기"
          cancelText="취소"
          variant="danger"
          onConfirm={confirmDeleteTodo}
          onClose={() => setDeleteTodoTargetId(null)}
        />

        {editingTodo && (
          <AddTodoModal
            todo={editingTodo}
            categoryOptions={categoryOptions}
            onClose={() => setEditingTodo(null)}
            onAdd={(input) => updateTodo(editingTodo.id, input)}
          />
        )}

        {/* 우측 컬럼 (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
          <section className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] flex flex-col h-full min-h-[600px]">
            <div className="p-4 lg:p-6 border-b border-[#f0e8d9]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#201b14]">할 일 목록</h3>
                  <p className="text-[11px] text-[#9b8f7c] mt-0.5">{selectedDateLabel} 기준</p>
                </div>
                <button className="text-[#867b6a] hover:text-[#775a1c] p-1">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
              <QuickAddTodoBar categoryOptions={categoryOptions} onAdd={addTodo} />
            </div>

            <div ref={scrollRef} onWheel={handleWheelScroll} className="flex-grow p-4 lg:p-6 overflow-y-auto space-y-8">
              <div>
                <h4 className="text-[11px] font-bold text-[#9b8f7c] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9b8f7c]" /> 대기 중 ({pending.length})
                </h4>
                <div className="space-y-3">
                  {pending.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-3 p-3 bg-[#f4ead8]/50 rounded-xl hover:bg-[#f4ead8] transition-colors"
                    >
                      <button
                        onClick={() => toggleComplete(todo)}
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
                          {todo.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] text-[#9b8f7c]">
                              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                              {todo.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setEditingTodo(todo)}
                          className="p-1 text-[#9b8f7c] hover:text-[#775a1c] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTodoTargetId(todo.id)}
                          className="p-1 text-[#9b8f7c] hover:text-[#c62828] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {pending.length === 0 && <p className="text-[12.5px] text-[#9b8f7c]">대기 중인 항목이 없습니다.</p>}
                </div>
              </div>

              <div className="opacity-60">
                <h4 className="text-[11px] font-bold text-[#476737] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#476737]" /> 완료됨 ({completed.length})
                </h4>
                <div className="space-y-3">
                  {completed.map((todo) => (
                    <div key={todo.id} className="group flex items-start gap-3 p-3 bg-[#faf4e9] rounded-xl">
                      <button
                        onClick={() => toggleComplete(todo)}
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

      <button
        onClick={() => setIsAddTodoOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#775a1c] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[60] group"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform">add</span>
      </button>

      {isAddTodoOpen && (
        <AddTodoModal
          categoryOptions={categoryOptions}
          onClose={() => setIsAddTodoOpen(false)}
          onAdd={addTodo}
        />
      )}
    </>
  );
}