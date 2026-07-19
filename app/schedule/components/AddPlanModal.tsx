// app/components/AddPlanModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PlanCategoryOption {
  id: number;
  categoryName: string;
}

interface PlanLike {
  id: number;
  title: string;
  content: string | null;
  startDate: string;
  endDate: string;
  color: string | null;
  categoryId: number | null;
}

const colorPresets = [
  { label: "브라운", value: "#775a1c" },
  { label: "테라코타", value: "#924b29" },
  { label: "그린", value: "#476737" },
  { label: "블루그레이", value: "#4a5a75" },
  { label: "머스타드", value: "#c9a45f" },
];

interface AddPlanModalProps {
  defaultDate: string; // YYYY-MM-DD (신규 생성 시 기본 날짜)
  plan?: PlanLike; // 있으면 수정 모드
  categoryOptions: PlanCategoryOption[];
  onClose: () => void;
  onAdd: (input: {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    color: string;
    categoryId: number | null;
  }) => void | Promise<void>;
}

function splitIso(iso: string) {
  const [date, timePart] = iso.split("T");
  const time = timePart ? timePart.slice(0, 5) : "00:00";
  return { date, time };
}

export default function AddPlanModal({
  defaultDate,
  plan,
  categoryOptions,
  onClose,
  onAdd,
}: AddPlanModalProps) {
  const isEditMode = !!plan;

  const initialStart = plan ? splitIso(plan.startDate) : { date: defaultDate, time: "09:00" };
  const initialEnd = plan ? splitIso(plan.endDate) : { date: defaultDate, time: "10:00" };
  // 저장 시 00:00~23:59로 만든 종일 일정을 다시 열었을 때 종일 토글이 자동으로 켜지도록 추정
  const inferredAllDay = plan ? initialStart.time === "00:00" && initialEnd.time === "23:59" : false;

  const [isAllDay, setIsAllDay] = useState(inferredAllDay);
  const [form, setForm] = useState({
    title: plan?.title ?? "",
    content: plan?.content ?? "",
    startDate: initialStart.date,
    startTime: initialStart.time,
    endDate: initialEnd.date,
    endTime: initialEnd.time,
    color: plan?.color ?? colorPresets[0].value,
    categoryId: plan?.categoryId ? String(plan.categoryId) : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isEditMode) return; // 수정 모드에서는 기존 카테고리를 그대로 유지
    setForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId || (categoryOptions[0]?.id ? String(categoryOptions[0].id) : ""),
    }));
  }, [categoryOptions, isEditMode]);

  useEffect(() => {
    if (form.endDate < form.startDate) {
      setForm((prev) => ({ ...prev, endDate: prev.startDate }));
    }
  }, [form.startDate, form.endDate]);

  const isValid =
    !!form.title &&
    !!form.startDate &&
    !!form.endDate &&
    form.endDate >= form.startDate &&
    (isAllDay || (!!form.startTime && !!form.endTime));

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const startDate = isAllDay
        ? `${form.startDate}T00:00:00`
        : `${form.startDate}T${form.startTime}:00`;
      const endDate = isAllDay
        ? `${form.endDate}T23:59:59`
        : `${form.endDate}T${form.endTime}:00`;

      await onAdd({
        title: form.title,
        content: form.content,
        startDate,
        endDate,
        color: form.color,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b14]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#fef2e6] w-full max-w-[560px] rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#eee4d3] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center px-8 pt-8 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#201b14]">{isEditMode ? "일정 수정" : "일정 추가"}</h3>
            <p className="text-xs text-[#867b6a] mt-1">
              {isEditMode ? "일정 내용을 수정하세요." : "새로운 일정을 등록하세요."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#9b8f7c] hover:bg-[#ece1d5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">제목</label>
            <input
              type="text"
              placeholder="예: 팀 미팅"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">메모 (선택)</label>
            <input
              type="text"
              placeholder="예: 3분기 로드맵 논의"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
            />
          </div>

          {/* 종일 토글 */}
          <div className="flex items-center justify-between bg-white border border-[#eee4d3] rounded-xl py-3 px-4">
            <label className="text-[13px] font-bold text-[#201b14]">종일</label>
            <button
              type="button"
              onClick={() => setIsAllDay((prev) => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isAllDay ? "bg-[#775a1c]" : "bg-[#ddd4c9]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAllDay ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 시작 날짜 / 시간 */}
          <div className={`grid ${isAllDay ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">시작 날짜</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              />
            </div>
            {!isAllDay && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#867b6a] ml-1">시작 시간</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* 종료 날짜 / 시간 */}
          <div className={`grid ${isAllDay ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">종료 날짜</label>
              <input
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              />
            </div>
            {!isAllDay && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#867b6a] ml-1">종료 시간</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">카테고리</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
            >
              {categoryOptions.length === 0 && <option value="">등록된 카테고리 없음</option>}
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">색상</label>
            <div className="flex gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color: c.value }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c.value ? "ring-2 ring-offset-2 ring-[#775a1c]" : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="px-8 py-6 bg-[#faf4e9] border-t border-[#f0e8d9] flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-3 text-[#867b6a] font-bold rounded-xl hover:bg-[#ece1d5] transition-all">
            취소
          </button>
          <button
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-xl font-bold transition-all ${
              isValid && !isSubmitting
                ? "bg-[#775a1c] text-white hover:brightness-110 active:scale-[0.98] shadow-md"
                : "bg-[#ddd4c9] text-[#9b8f7c] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "저장 중..." : isEditMode ? "수정 완료" : "저장"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}