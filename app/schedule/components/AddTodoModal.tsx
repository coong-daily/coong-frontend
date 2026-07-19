"use client";

import React, { useState } from "react";

interface TodoItem {
  id: number;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  dueDate: string | null;
  createdAt: string;
  progress: number | null;
  categoryId: number | null;
  categoryName: string | null;
}

interface AddTodoModalProps {
  todo?: TodoItem; // 있으면 수정 모드
  categoryOptions: { id: number; categoryName: string }[];
  onClose: () => void;
  onAdd: (input: {
    title: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    dueDate: string | null;
    categoryId: number | null;
  }) => void;
}

export default function AddTodoModal({
  todo,
  categoryOptions,
  onClose,
  onAdd,
}: AddTodoModalProps) {
  const isEditMode = !!todo;

  const [title, setTitle] = useState(todo?.title ?? "");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">(
    todo?.priority ?? "MEDIUM"
  );
  const [dueDate, setDueDate] = useState<string>(todo?.dueDate ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    todo?.categoryId ?? null
  );

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("할 일 제목을 입력해주세요.");
      return;
    }

    onAdd({
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      categoryId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4">
      <div className="bg-[#fffdf9] rounded-[18px] w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[17px] font-bold text-[#201b14]">
            {isEditMode ? "할 일 수정" : "할 일 추가"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#9b8f7c] hover:text-[#201b14] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-[#867b6a] mb-1 block">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full px-3 py-2 rounded-lg border border-[#eee4d3] bg-[#faf4e9] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#775a1c]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#867b6a] mb-1 block">
              우선순위
            </label>
            <div className="flex gap-2">
              {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-[12.5px] font-bold border transition-colors ${
                    priority === p
                      ? "bg-[#775a1c] text-white border-[#775a1c]"
                      : "bg-[#faf4e9] text-[#867b6a] border-[#eee4d3] hover:bg-[#f4ead8]"
                  }`}
                >
                  {p === "HIGH" ? "높음" : p === "MEDIUM" ? "중간" : "낮음"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#867b6a] mb-1 block">
              마감일
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#eee4d3] bg-[#faf4e9] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#775a1c]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#867b6a] mb-1 block">
              카테고리
            </label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 rounded-lg border border-[#eee4d3] bg-[#faf4e9] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#775a1c]"
            >
              <option value="">선택 안 함</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-bold text-[13.5px] bg-[#f4ead8] text-[#867b6a] hover:bg-[#eee4d3] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg font-bold text-[13.5px] bg-[#775a1c] text-white hover:brightness-110 transition-all"
          >
            {isEditMode ? "수정하기" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}