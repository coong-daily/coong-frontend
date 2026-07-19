"use client";

import React, { useState } from "react";
import { AccountResponseDto } from "@/app/types/account";

const bankList = [
  "토스뱅크",
  "카카오뱅크",
  "우리은행",
  "신한은행",
  "국민은행",
  "IBK기업은행",
];

interface AccountModalProps {
  account?: AccountResponseDto; // 있으면 수정 모드, 없으면 추가 모드
  defaultAccountType?: string; // 신규 생성 시 초기 선택될 계좌 타입
  onClose: () => void;
  onSaved: (account: AccountResponseDto) => void;
}

export default function AccountModal({ account, defaultAccountType, onClose, onSaved }: AccountModalProps) {
  const isEditMode = !!account;

  const [form, setForm] = useState({
    bank: account?.bank ?? "",
    accountType: account?.accountType ?? defaultAccountType ?? "CHECKING",
    accountNumber: account?.accountNumber ?? "",
    balance: account ? String(account.balance) : "",
    maturityDate: account?.expiryDate ?? "",
    memo: account?.memo ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = !!form.bank && !!form.accountNumber;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      accountNumber: form.accountNumber,
      balance: Number(form.balance) || 0,
      bank: form.bank,
      accountType: form.accountType,
      expiryDate: form.maturityDate || null,
      currency: "KRW",
      status: account?.status ?? "ACTIVE",
      memo: form.memo,
    };

    try {
      console.log(payload);
      const url = isEditMode
        ? `http://localhost:8080/asset/account/${account!.id}`
        : "http://localhost:8080/asset/account";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(isEditMode ? "계좌 수정에 실패했습니다." : "계좌 추가에 실패했습니다.");
      const saved: AccountResponseDto = await res.json();
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(isEditMode ? "계좌 수정 실패:" : "계좌 추가 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b14]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#fef2e6] w-full max-w-[640px] rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#eee4d3] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <header className="flex justify-between items-center px-8 pt-8 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#201b14]">
              {isEditMode ? "계좌 수정하기" : "계좌 연결하기"}
            </h3>
            <p className="text-xs text-[#867b6a] mt-1">
              {isEditMode
                ? "계좌 정보를 수정합니다."
                : "Lumina Life OS가 안전하게 금융 데이터를 동기화합니다."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#9b8f7c] hover:bg-[#ece1d5] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-8 py-6 max-h-[420px] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">은행</label>
              <select
                value={form.bank}
                onChange={(e) => setForm((prev) => ({ ...prev, bank: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              >
                <option value="" disabled>
                  은행을 선택하세요
                </option>
                {bankList.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">계좌 종류</label>
              <select
                value={form.accountType}
                onChange={(e) => setForm((prev) => ({ ...prev, accountType: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              >
                <option value="CHECKING">입출금</option>
                <option value="SAVINGS">저축</option>
                <option value="INVESTMENT">투자</option>
                <option value="EMERGENCY">비상금</option>
                <option value="PENSION">연금</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">계좌 번호</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="계좌 번호를 입력하세요"
                value={form.accountNumber}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                  setForm((prev) => ({ ...prev, accountNumber: onlyNumbers }));
                }}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#867b6a] ml-1">현재 잔액</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.balance}
                  onChange={(e) => setForm((prev) => ({ ...prev, balance: e.target.value }))}
                  className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
                />
              </div>
              {form.accountType === "SAVINGS" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#867b6a] ml-1">만기일</label>
                  <input
                    type="date"
                    value={form.maturityDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, maturityDate: e.target.value }))}
                    className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">메모</label>
              <textarea
                placeholder="계좌에 대한 메모를 남겨보세요 (선택)"
                value={form.memo}
                onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
                rows={3}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <footer className="px-8 py-6 bg-[#faf4e9] border-t border-[#f0e8d9] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[#867b6a] font-bold rounded-xl hover:bg-[#ece1d5] transition-all"
          >
            취소
          </button>
          <button
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-xl font-bold transition-all ${
              isValid && !isSubmitting
                ? "bg-[#924b29] text-white hover:bg-[#924b29]/90 active:scale-[0.98] shadow-md"
                : "bg-[#ddd4c9] text-[#9b8f7c] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "저장 중..." : isEditMode ? "수정 완료" : "계좌 추가"}
          </button>
        </footer>
      </div>
    </div>
  );
}