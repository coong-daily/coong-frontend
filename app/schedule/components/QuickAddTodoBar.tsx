// app/components/QuickAddTodoBar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

interface TodoCategoryOption {
  id: number;
  categoryName: string;
}

interface QuickAddTodoBarProps {
  categoryOptions: TodoCategoryOption[];
  onAdd: (input: {
    title: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    dueDate: string | null;
    categoryId: number | null;
  }) => void | Promise<void>;
}

export default function QuickAddTodoBar({ categoryOptions, onAdd }: QuickAddTodoBarProps) {
  const [title, setTitle] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("LOW");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 패널 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPanelOpen]);

  const isValid = !!title.trim();

  const resetForm = () => {
    setTitle("");
    setPriority("LOW");
    setDueDate("");
    setCategoryId("");
    setIsPanelOpen(false);
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
        categoryId: categoryId ? Number(categoryId) : null,
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsPanelOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setIsPanelOpen(false);
          }}
          className="w-full bg-[#faf4e9] border-none rounded-xl py-3 pl-11 pr-4 text-[13.5px] focus:ring-2 focus:ring-[#775a1c]/20 outline-none"
          placeholder="새로운 할 일 추가..."
          type="text"
        />
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8f7c] hover:text-[#775a1c] disabled:opacity-40"
        >
          <span className="material-symbols-outlined">add_circle</span>
        </button>
      </div>

      {isPanelOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white border border-[#eee4d3] rounded-xl shadow-lg p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#867b6a] ml-0.5">중요도</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
                className="w-full bg-[#faf4e9] border border-[#eee4d3] rounded-lg py-1.5 px-2 text-[12px] text-[#201b14] outline-none"
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">중간</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#867b6a] ml-0.5">마감일</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#faf4e9] border border-[#eee4d3] rounded-lg py-1.5 px-2 text-[12px] text-[#201b14] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#867b6a] ml-0.5">카테고리</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#faf4e9] border border-[#eee4d3] rounded-lg py-1.5 px-2 text-[12px] text-[#201b14] outline-none"
            >
              <option value="">없음</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="px-3 py-1.5 text-[11px] font-bold text-[#867b6a] rounded-lg hover:bg-[#f0e8d9] transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                isValid && !isSubmitting
                  ? "bg-[#775a1c] text-white hover:brightness-110"
                  : "bg-[#ddd4c9] text-[#9b8f7c] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}