"use client";

import React, { useState, useEffect } from "react";
import { AssetResponse, AccountResponseDto } from "@/app/types/account";
import AccountModal from "@/app/assets/components/AccountModal";
import TransactionHistory from "@/app/assets/components/TransactionHistory";
import ConnectedAccounts from "./components/ConnectedAccount";

export default function AssetsPage() {
  const [dbAssets, setDbAssets] = useState<AssetResponse[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"accounts" | "transactions">("accounts");
  const [accounts, setAccounts] = useState<AccountResponseDto[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountResponseDto | null>(null);
  const [defaultAccountType, setDefaultAccountType] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log("AssetsPage 컴포넌트가 마운트되었습니다. 데이터를 가져옵니다...");

    // 자산 총액 데이터 불러오기
    fetch("http://localhost:8080/asset/total")
      .then((res) => {
        if (!res.ok) throw new Error("네트워크 응답에 문제가 있습니다.");
        return res.json();
      })
      .then((data: AssetResponse[]) => {
        setDbAssets(data);
        const sum = data.reduce((acc, asset) => acc + asset.amount, 0);
        setTotalAmount(sum);
      })
      .catch((err) => {
        console.error("자산 데이터 로드 실패:", err);
      });

    // 계좌 목록 데이터 불러오기
    fetch("http://localhost:8080/asset/accounts")
      .then((res) => {
        if (!res.ok) throw new Error("네트워크 응답에 문제가 있습니다.");
        return res.json();
      })
      .then((data: AccountResponseDto[]) => {
        setAccounts(data);
      })
      .catch((err) => {
        console.error("계좌 데이터 로드 실패:", err);
      });
  }, []);

  // 자산 종류별 색상 매핑 (도넛 차트 & 뱃지용)
  const assetColors: Record<string, string> = {
    입출금: "#775a1c",
    저축: "#924b29",
    투자: "#d4805a",
    비상금: "#c9a45f",
  };

  //계좌 삭제
  const handleDeleteAccount = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/asset/account/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("계좌 삭제에 실패했습니다.");
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("계좌 삭제 실패:", err);
    }
  };

  return (
    <div className="bg-[#f4ead8] min-h-screen">
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 md:gap-4">
        <div>
          <p className="text-[10px] md:text-[12px] font-bold text-[#924b29] uppercase tracking-wide">
            Financial Equilibrium
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-bold tracking-tight text-[#201b14] leading-tight mt-1">
            Asset Repository
          </h2>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-[#eee4d3] rounded-xl font-bold text-[#775a1c] flex items-center gap-2 hover:bg-[#faf4e9] transition-colors shadow-sm active:scale-95 text-xs md:text-sm">
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">ios_share</span>
            Export Report
          </button>
          <button className="px-4 md:px-5 py-2 md:py-2.5 bg-[#775a1c] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:brightness-110 transition-all active:scale-95 text-xs md:text-sm">
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">account_balance_wallet</span>
            Connect Bank
          </button>
        </div>
      </div>

      {/* 벤토 그리드 레이아웃 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-5">
        {/* 순자산 카드 (Net Worth) */}
        <div className="sm:col-span-2 lg:col-span-8 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-3 md:p-4 lg:p-5 relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(150,120,70,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdea6]/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6 md:mb-10">
              <div>
                <h3 className="text-[#867b6a] font-bold mb-1 text-xs md:text-sm">Estimated Net Worth</h3>
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#201b14] tracking-tight">
                    {totalAmount}원
                  </span>
                  <span className="flex items-center text-[#476737] font-bold bg-[#c8eeb1]/30 px-2 py-0.5 rounded-lg text-[11px] md:text-sm">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
                    +4.2%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] md:text-xs text-[#9b8f7c] block mb-1">Updated 2m ago</span>
                <div className="flex gap-1 justify-end">
                  <div className="w-2 h-2 rounded-full bg-[#476737]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#476737]/40"></div>
                  <div className="w-2 h-2 rounded-full bg-[#476737]/20"></div>
                </div>
              </div>
            </div>

            {/* 자산 종류별 뱃지 */}
            {dbAssets.length > 0 && (
              <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
                {dbAssets.map((asset) => (
                  <span
                    key={asset.id}
                    className="text-[11px] md:text-xs bg-[#faf4e9] px-2.5 py-1 rounded-md text-[#775a1c] border border-[#eee4d3] font-medium"
                  >
                    {asset.name}: {asset.amount}원
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-[#f0e8d9]">
              <div className="bg-[#faf4e9] p-4 md:p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#c8eeb1] text-[#476737] rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                  </div>
                  <p className="text-[#867b6a] font-bold text-xs md:text-sm">Monthly Income</p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#201b14]">$12,450.00</p>
                <p className="text-[11px] md:text-xs text-[#476737] mt-1 font-medium">85% of monthly goal reached</p>
                <div className="mt-4 h-1.5 w-full bg-[#f8ece0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#476737] w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="bg-[#faf4e9] p-4 md:p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#ffdbcd] text-[#924b29] rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                  </div>
                  <p className="text-[#867b6a] font-bold text-xs md:text-sm">Monthly Expense</p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#201b14]">$6,820.00</p>
                <p className="text-[11px] md:text-xs text-[#924b29] mt-1 font-medium">Under budget by $400</p>
                <div className="mt-4 h-1.5 w-full bg-[#f8ece0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#924b29] w-[55%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 자산 배분 (도넛 차트) */}
        <div className="sm:col-span-2 lg:col-span-4 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-3 md:p-4 lg:p-5 flex flex-col transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(150,120,70,0.1)]">
          <h3 className="text-[15px] font-bold text-[#201b14] mb-6">Asset Allocation</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-6 md:mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f0e8d9" strokeWidth="12" />
                {(() => {
                  const total = dbAssets.reduce((acc, a) => acc + a.amount, 0);
                  let offset = 0;
                  const circumference = 251;
                  return dbAssets.map((asset) => {
                    const ratio = total > 0 ? asset.amount / total : 0;
                    const dash = ratio * circumference;
                    const circle = (
                      <circle
                        key={asset.id}
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke={assetColors[asset.name] ?? "#775a1c"}
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset={-offset}
                        strokeWidth="12"
                      />
                    );
                    offset += dash;
                    return circle;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] md:text-xs text-[#9b8f7c]">Diversification</span>
                <span className="text-lg md:text-xl font-bold text-[#775a1c]">High</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {dbAssets.map((asset) => {
                const total = dbAssets.reduce((acc, a) => acc + a.amount, 0);
                const percent = total > 0 ? Math.round((asset.amount / total) * 100) : 0;
                return (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: assetColors[asset.name] ?? "#775a1c" }}
                      ></div>
                      <span className="text-[13.5px] text-[#201b14]">{asset.name}</span>
                    </div>
                    <span className="font-bold text-sm">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          {/* 탭 네비게이션 (Weekly Transactions ↔ Connected Accounts 순서 교체됨) */}
          <div className="flex gap-0 mb-6">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 px-5 py-3 font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 rounded-l-lg ${
                activeTab === "transactions"
                  ? "bg-[#775a1c] text-white shadow-md"
                  : "bg-white text-[#9b8f7c] border border-[#eee4d3] hover:text-[#775a1c]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              Weekly Transactions
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex-1 px-5 py-3 font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 rounded-r-lg ${
                activeTab === "accounts"
                  ? "bg-[#775a1c] text-white shadow-md"
                  : "bg-white text-[#9b8f7c] border border-[#eee4d3] hover:text-[#775a1c]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
              Connected Accounts
            </button>
          </div>
        </div>

        {/* 연결된 계좌 & 거래내역 탭 */}
        <div className="sm:col-span-2 lg:col-span-12 bg-[#fffdf9] rounded-[18px] border border-[#eee4d3] shadow-[0_6px_22px_rgba(150,120,70,0.06)] p-3 md:p-4 lg:p-5 transition-all hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(150,120,70,0.1)]">
          {activeTab === "accounts" && (
            <ConnectedAccounts
              accounts={accounts}
              onEditAccount={setEditingAccount}
              onDeleteAccount={handleDeleteAccount}
              onAddAccountClick={(accountType) => {
                setDefaultAccountType(accountType);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === "transactions" && <TransactionHistory />}
        </div>
      </div>

      {(isAddModalOpen || editingAccount) && (
        <AccountModal
          account={editingAccount ?? undefined}
          defaultAccountType={!editingAccount ? defaultAccountType : undefined}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAccount(null);
            setDefaultAccountType(undefined);
          }}
          onSaved={(saved) => {
            if (editingAccount) {
              setAccounts((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
            } else {
              setAccounts((prev) => [...prev, saved]);
            }
            setIsAddModalOpen(false);
            setEditingAccount(null);
            setDefaultAccountType(undefined);
          }}
        />
      )}
    </div>
  );
}