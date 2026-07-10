// app/components/Diary.tsx
"use client";

import React, { useEffect, useState } from "react";

interface DiaryRecord {
  id: number;
  date: string; // "10월 25일 화"
  emoji: string;
  preview: string;
  score: number;
  content: string;
  weather: string;
  location: string;
}

const moodEmojis = ["😫", "😕", "😐", "😊", "🤩"];

const initialRecords: DiaryRecord[] = [
  {
    id: 1,
    date: "10월 25일 화",
    emoji: "😊",
    preview: "오늘은 아침부터 컨디션이...",
    score: 8,
    content: "",
    weather: "맑음",
    location: "서울",
  },
  {
    id: 2,
    date: "10월 24일 월",
    emoji: "😴",
    preview: "바빴지만 무난한 하루",
    score: 6,
    content: "바빴지만 무난한 하루를 보냈다.",
    weather: "흐림",
    location: "서울",
  },
  {
    id: 3,
    date: "10월 23일 일",
    emoji: "😕",
    preview: "조금 지친 느낌",
    score: 5,
    content: "조금 지친 느낌이 드는 하루였다.",
    weather: "비",
    location: "서울",
  },
  {
    id: 4,
    date: "10월 22일 토",
    emoji: "🤩",
    preview: "가족 모임, 행복했다",
    score: 9,
    content: "가족 모임이 있었고 정말 행복했다.",
    weather: "맑음",
    location: "서울",
  },
];

export default function Diary() {
  const [records, setRecords] = useState<DiaryRecord[]>(initialRecords);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [editorMode, setEditorMode] = useState<"keyboard" | "handwrite">("keyboard");
  const [mounted, setMounted] = useState(false);

  // 최초 마운트 시 페이드인 효과
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedRecord = records.find((r) => r.id === selectedId) ?? records[0];

  const updateSelectedRecord = (patch: Partial<DiaryRecord>) => {
    setRecords((prev) => prev.map((r) => (r.id === selectedId ? { ...r, ...patch } : r)));
  };

  const handleSave = () => {
    // 실제 서비스라면 여기서 API 호출
    alert("일기가 저장되었습니다.");
  };

  return (
    <div
      className={`transition-opacity duration-700 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* 페이지 상단 바 (날짜 이동 / 새 일기 버튼) — Header 컴포넌트와 별개로 페이지 전용 서브헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#201b14]">다이어리</h2>
          <div className="flex items-center text-[#9b8f7c] text-sm font-medium gap-2">
            <button className="material-symbols-outlined text-base hover:text-[#775a1c] transition-colors">
              chevron_left
            </button>
            <span>2023년 10월</span>
            <button className="material-symbols-outlined text-base hover:text-[#775a1c] transition-colors">
              chevron_right
            </button>
          </div>
        </div>
        <button className="bg-[#924b29] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-lg">add</span>
          새 일기
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-9rem)]">
        {/* 왼쪽: 지난 기록 */}
        <section className="w-full lg:w-1/4 flex flex-col gap-5">
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-5 flex-grow flex flex-col max-h-80 lg:max-h-none">
            <h3 className="text-xs font-bold text-[#9b8f7c] uppercase mb-4 tracking-wider">지난 기록</h3>
            <div className="overflow-y-auto flex-grow space-y-3 pr-1">
              {records.map((record) => (
                <button
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedId === record.id
                      ? "border-2 border-[#c9a45f]/40 bg-[#fffdf9]"
                      : "border border-transparent hover:bg-[#faf4e9]"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl">{record.emoji}</span>
                    <div>
                      <p className="font-bold text-[13px] text-[#201b14]">{record.date}</p>
                      <p className="text-[11px] text-[#867b6a] line-clamp-1 mt-0.5">{record.preview}</p>
                      <p
                        className={`text-[10px] mt-1 font-bold ${
                          selectedId === record.id ? "text-[#775a1c]" : "text-[#9b8f7c]"
                        }`}
                      >
                        {record.score} / 10
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 중앙: 에디터 */}
        <section className="flex-grow flex flex-col gap-5">
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-6 lg:p-8 flex-grow flex flex-col relative min-h-[500px]">
            {/* 에디터 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#201b14] mb-1">{selectedRecord.date}요일</h2>
                <div className="flex items-center gap-2 text-[#9b8f7c] text-xs">
                  <span>{selectedRecord.weather}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a45f]" />
                  <span>{selectedRecord.location}</span>
                </div>
              </div>
              <div className="flex bg-[#faf4e9] rounded-lg p-1 gap-1">
                <button
                  onClick={() => setEditorMode("keyboard")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
                    editorMode === "keyboard" ? "bg-white shadow-sm text-[#201b14]" : "text-[#867b6a] hover:bg-white/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">keyboard</span>
                  키보드
                </button>
                <button
                  onClick={() => setEditorMode("handwrite")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                    editorMode === "handwrite" ? "bg-white shadow-sm text-[#201b14]" : "text-[#867b6a] hover:bg-white/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  손글씨
                </button>
              </div>
            </div>

            {/* 본문 입력 영역 */}
            <div className="flex-grow relative mt-4 overflow-hidden">
              <textarea
                value={selectedRecord.content}
                onChange={(e) => updateSelectedRecord({ content: e.target.value })}
                className="w-full h-full bg-transparent border-none focus:ring-0 outline-none text-[13.5px] text-[#4e4639] placeholder:text-[#9b8f7c] resize-none p-0"
                style={{
                  backgroundImage: "linear-gradient(#d1c5b4 1px, transparent 1px)",
                  backgroundSize: "100% 1.95rem",
                  lineHeight: "1.95rem",
                  backgroundAttachment: "local",
                }}
                placeholder="오늘은 어떤 하루였나요?"
              />
            </div>

            {/* 하단: 기분 선택 & 점수 */}
            <div className="mt-8 pt-6 border-t border-[#f0e8d9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-[13px] font-bold text-[#201b14]">오늘 하루 점수</span>
                <div className="flex gap-3">
                  {moodEmojis.map((emoji, idx) => {
                    const moodScore = (idx + 1) * 2; // 2,4,6,8,10
                    const isSelected = selectedRecord.score === moodScore;
                    return (
                      <button
                        key={emoji}
                        onClick={() => updateSelectedRecord({ score: moodScore })}
                        className={`text-2xl transition-all ${
                          isSelected ? "scale-110" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const filled = idx < Math.round(selectedRecord.score / 2);
                    return (
                      <span
                        key={idx}
                        className={`material-symbols-outlined text-xl ${
                          filled ? "text-[#c9a45f]" : "text-[#d1c5b4]"
                        }`}
                        style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        star
                      </span>
                    );
                  })}
                  <span className="ml-2 text-xl font-bold text-[#775a1c]">{selectedRecord.score} / 10</span>
                </div>
                <button
                  onClick={handleSave}
                  className="bg-[#924b29] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#743414] transition-colors shadow-sm"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 오른쪽: 위젯 */}
        <section className="w-full lg:w-1/4 flex flex-col gap-5">
          {/* 무드 캘린더 */}
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-5">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#775a1c] text-lg">sentiment_satisfied</span>
              <h3 className="font-bold text-sm text-[#201b14]">무드 캘린더</h3>
            </div>
            <div className="grid grid-cols-7 gap-y-3 gap-x-1 justify-items-center">
              {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                <span key={d} className="text-xs text-[#9b8f7c] font-bold">
                  {d}
                </span>
              ))}

              {["😊", "😊", ".", "😐", "😊", "🤩", "🤩"].map((e, i) => (
                <span key={`w1-${i}`} className={`text-sm ${e === "." ? "opacity-20" : ""}`}>
                  {e}
                </span>
              ))}
              {["😐", "😊", "🤩", ".", "😐", "😊", "😊"].map((e, i) => (
                <span key={`w2-${i}`} className={`text-sm ${e === "." ? "opacity-20" : ""}`}>
                  {e}
                </span>
              ))}
              {["😊", "🤩", "😊", "😐", "🤩", ".", "😊"].map((e, i) => (
                <span key={`w3-${i}`} className={`text-sm ${e === "." ? "opacity-20" : ""}`}>
                  {e}
                </span>
              ))}

              {/* 오늘(선택됨) 표시 */}
              <div className="w-8 h-8 flex items-center justify-center bg-[#faf4e9] rounded-lg ring-1 ring-[#c9a45f]">
                <span className="text-sm">😊</span>
              </div>
              {[".", ".", ".", ".", ".", "."].map((e, i) => (
                <span key={`w4-${i}`} className="text-sm opacity-20">
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* 월 평균 위젯 */}
          <div className="bg-[#fffdf9] border border-[#eee4d3] rounded-[18px] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-6 flex flex-col flex-grow">
            <div className="mb-2">
              <p className="text-xs font-bold text-[#9b8f7c]">이번 달 평균</p>
              <h4 className="text-4xl font-bold text-[#201b14] mt-2">
                7.2 <span className="text-lg font-bold text-[#9b8f7c]">/ 10</span>
              </h4>
            </div>
            <div className="flex-grow mt-6 flex items-end">
              <svg className="w-full h-24" viewBox="0 0 200 100">
                <polyline
                  fill="none"
                  points="0,80 20,60 40,75 60,40 80,55 100,20 120,45 140,30 160,25 180,10 200,5"
                  stroke="#d4805a"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0e8d9]">
              <p className="text-xs font-medium text-[#867b6a]">
                지난달보다 <span className="text-[#924b29] font-bold">+0.8점</span> 좋아졌어요
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}