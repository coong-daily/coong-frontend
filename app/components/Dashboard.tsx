import React from 'react';

export default function Dashboard() {
  return (
    <>
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#201b14] leading-tight">
            Good morning, Julian
          </h2>
          <p className="text-sm sm:text-[13.5px] text-[#867b6a] mt-1">
            Today is Tuesday, Oct 24th • You have 4 focused tasks and 3 meetings.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#fef2e6] px-3 py-2 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[#775a1c] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              wb_sunny
            </span>
            <span className="font-bold text-[14px]">72°F</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
          {/* 자산 관리 현황 */}
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-[#e7b48a] to-[#d4805a] rounded-[18px] p-4 lg:p-6 text-white shadow-[0_6px_22px_rgba(150,120,70,0.06)]">
            {/* 감정/명언 카드 */}
          </div>
          <div className="bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
            {/* 일정 위젯 */}
          </div>
        </div>
        <div className="lg:col-span-4 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
          {/* 우선순위 할 일 목록 */}
        </div>
        <div className="lg:col-span-4 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
          {/* 가계부 예산 상태 */}
        </div>
        <div className="lg:col-span-12 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-4 lg:p-6">
          {/* 오늘의 습관 트래커 */}
        </div>
      </div>
    </>
  );
}