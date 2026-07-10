"use client";

import React, { useEffect, useState } from "react";
import { AccountResponseDto } from "@/app/types/account";
import ConfirmModal from "@/app/components/ConfirmModal";

interface ConnectedAccountsProps {
  accounts: AccountResponseDto[];
  onEditAccount: (account: AccountResponseDto) => void;
  onDeleteAccount: (id: number) => void | Promise<void>;
  onAddAccountClick: (accountType: string) => void;
}

// 은행별 색상 및 아이콘 매핑
const bankColors: Record<string, { bg: string; color: string; icon: string }> = {
  "토스뱅크": { bg: "#e8f4ff", color: "#0066ff", icon: "🏦" },
  "카카오뱅크": { bg: "#fff8e1", color: "#ffeb3b", icon: "🏦" },
  "우리은행": { bg: "#fce4ec", color: "#e91e63", icon: "🏦" },
  "신한은행": { bg: "#e8f5e9", color: "#4caf50", icon: "🏦" },
  "국민은행": { bg: "#f3e5f5", color: "#9c27b0", icon: "🏦" },
  "IBK기업은행": { bg: "#ffe0b2", color: "#ff9800", icon: "🏦" },
};

// 계좌 상태별 스타일 매핑
const statusStyles: Record<string, { color: string; text: string }> = {
  "ACTIVE": { color: "#476737", text: "정상" },
  "TERMINATED": { color: "#c62828", text: "해지" },
  "DORMANT": { color: "#e65100", text: "휴면" },
  "RESTRICTED": { color: "#880e4f", text: "거래제한" },
};

function getBankStyle(bank: string) {
  return bankColors[bank] || { bg: "#f5f5f5", color: "#757575", icon: "🏦" };
}

function getStatusStyle(status: string) {
  return statusStyles[status] || { color: "#616161", text: status };
}

export default function ConnectedAccounts({
  accounts,
  onEditAccount,
  onDeleteAccount,
  onAddAccountClick,
}: ConnectedAccountsProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{ type: "delete" | null; accountId: number | null }>({
    type: null,
    accountId: null,
  });

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  // accountType별로 계좌 그룹화 및 총액 계산
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      const type = account.accountType;
      if (!acc[type]) {
        acc[type] = { accounts: [], total: 0 };
      }
      acc[type].accounts.push(account);
      acc[type].total += account.balance;
      return acc;
    },
    {} as Record<string, { accounts: AccountResponseDto[]; total: number }>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[15px] font-bold text-[#201b14]">Connected Accounts</h3>
        <button className="text-[#775a1c] font-bold text-sm flex items-center hover:underline">
          Manage Connections
          <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAccounts).map(([accountType, { accounts: typeAccounts, total }]) => (
          <div key={accountType}>
            {/* 계좌 타입별 헤더 */}
            <div className="mb-4 flex justify-between items-center">
              <h4 className="text-[15px] font-bold text-[#201b14]">{accountType}</h4>
              <div className="text-right">
                <p className="text-xs text-[#9b8f7c] mb-1">합계</p>
                <p className="text-lg font-bold text-[#775a1c]">${total.toLocaleString()}</p>
              </div>
            </div>

            {/* 계좌 타입별 계좌 목록 */}
            <div className="flex overflow-x-auto gap-4 pb-2">
              {typeAccounts.map((account) => {
                const bankStyle = getBankStyle(account.bank);
                const statusStyle = getStatusStyle(account.status);
                const isMenuOpen = openMenuId === account.id;
                return (
                  <div
                    key={account.id}
                    className="p-5 border border-[#eee4d3] rounded-2xl hover:border-[#775a1c]/30 transition-all bg-[#faf4e9] flex-shrink-0 w-47.5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl shadow-sm flex items-center justify-center overflow-hidden shrink-0"
                          style={{ backgroundColor: bankStyle.bg }}
                        >
                          <span style={{ color: bankStyle.color }} className="text-lg">
                            {bankStyle.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#201b14] text-sm">{account.bank}</p>
                          <p className="text-xs text-[#9b8f7c] mt-0.5">{account.accountType}</p>
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : account.id);
                          }}
                          className="p-1.5 hover:bg-[#f0e8d9] rounded-lg transition-colors"
                          title="메뉴"
                        >
                          <img src="/icons/menu.png" alt="메뉴" className="w-[18px] h-[18px]" />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-9 z-20 w-32 bg-white border border-[#eee4d3] rounded-xl shadow-lg overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                onEditAccount(account);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#775a1c] hover:bg-[#f0e8d9] transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setModalState({ type: "delete", accountId: account.id });
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#c62828] hover:bg-[#ffcdd2] transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#9b8f7c] mb-3 truncate">{account.accountNumber}</p>

                    <div className="flex items-end justify-between mb-3">
                      <p className="text-xl font-bold text-[#201b14]">${account.balance.toLocaleString()}</p>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: statusStyle.color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.color }}></div>
                        {statusStyle.text}
                      </div>
                    </div>

                    {account.memo && (
                      <div className="pt-3 border-t border-[#f0e8d9]">
                        <p className="text-[11px] text-[#9b8f7c] leading-relaxed">{account.memo}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 이 계좌 타입 목록 끝에 추가 버튼 */}
              <button
                onClick={() => onAddAccountClick(accountType)}
                className="p-5 border-2 border-dashed border-[#eee4d3] rounded-2xl flex flex-col items-center justify-center hover:bg-[#faf4e9] transition-all group flex-shrink-0 w-47.5"
              >
                <div className="w-10 h-10 rounded-full bg-[#f8ece0] flex items-center justify-center mb-2 group-hover:bg-[#775a1c]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#775a1c]">add</span>
                </div>
                <p className="font-bold text-[#867b6a] text-sm">Add Account</p>
                <p className="text-[11px] text-[#9b8f7c] mt-0.5">{accountType}</p>
              </button>
            </div>
          </div>
        ))}

        <ConfirmModal
          isOpen={modalState.type === "delete"}
          title="계좌 삭제"
          message="이 계좌를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제하기"
          cancelText="취소"
          variant="danger"
          onConfirm={() => {
            if (modalState.accountId !== null) {
              onDeleteAccount(modalState.accountId);
            }
          }}
          onClose={() => setModalState({ type: null, accountId: null })}
        />
      </div>
    </>
  );
}