"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// 다른 화면에서 쓰던 것과 동일한 base path를 사용합니다.
// 실제 컨트롤러의 @RequestMapping 경로가 다르면 여기만 고치면 됩니다.
const API_BASE = "http://localhost:8080/asset";

interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  category: string; // 화면 표시/아이콘 매핑용 카테고리 이름
  amount: number; // 양수 = 수입, 음수 = 지출
  accountId?: number;
  cardId?: number;
  categoryId?: number;
}

// 계좌/카드/카테고리 선택 옵션 (백엔드에서 목록을 받아옵니다)
interface AccountOption {
  id: number;
  bank: string;
  accountNumber: string;
}

interface CardOption {
  id: number;
  cardName?: string;
  cardNumber?: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

const categoryIcons: Record<string, string> = {
  "쇼핑": "shopping_cart",
  "급여": "arrow_downward",
  "식비": "restaurant",
  "교통": "local_gas_station",
  "이자": "card_giftcard",
  "구독": "movie",
  "운동": "fitness_center",
  "부수입": "arrow_downward",
  "보너스": "arrow_downward",
  "기타": "receipt_long",
};

const categoryColor: Record<string, { bg: string; color: string }> = {
  "쇼핑": { bg: "#ffdbcd", color: "#924b29" },
  "급여": { bg: "#c8eeb1", color: "#476737" },
  "식비": { bg: "#ddd4c9", color: "#9b8f7c" },
  "교통": { bg: "#ddd4c9", color: "#9b8f7c" },
  "이자": { bg: "#c8eeb1", color: "#476737" },
  "구독": { bg: "#ffdbcd", color: "#924b29" },
  "운동": { bg: "#ddd4c9", color: "#9b8f7c" },
  "부수입": { bg: "#c8eeb1", color: "#476737" },
  "보너스": { bg: "#c8eeb1", color: "#476737" },
  "기타": { bg: "#ddd4c9", color: "#9b8f7c" },
};

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 월요일 시작
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function mapDtoToTransaction(dto: any): Transaction {
  const [date, timePart] = String(dto.transactionDate).split("T");
  const time = timePart ? timePart.slice(0, 5) : "00:00";
  const signedAmount =
    dto.transactionType === "EXPENSE" ? -Math.abs(dto.amount) : Math.abs(dto.amount);

  return {
    id: dto.id,
    date,
    time,
    title: dto.title,
    category: dto.category ?? "기타",
    amount: signedAmount,
    accountId: dto.accountId,
    cardId: dto.cardId,
  };
}

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 거래 추가 모달에서 선택할 계좌 / 카드 / 카테고리 목록
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [cardOptions, setCardOptions] = useState<CardOption[]>([]);
  const [incomeCategoryOptions, setIncomeCategoryOptions] = useState<CategoryOption[]>([]);
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<CategoryOption[]>([]);

  // 수입/지출 카테고리 목록 불러오기
  useEffect(() => {
    fetch(`${API_BASE}/categories/income`)
      .then((res) => {
        if (!res.ok) throw new Error("수입 카테고리를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: CategoryOption[]) => setIncomeCategoryOptions(data))
      .catch((err) => console.error("수입 카테고리 로드 실패:", err));

    fetch(`${API_BASE}/categories/expense`)
      .then((res) => {
        if (!res.ok) throw new Error("지출 카테고리를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: CategoryOption[]) => setExpenseCategoryOptions(data))
      .catch((err) => console.error("지출 카테고리 로드 실패:", err));
  }, []);

  // 선택된 날짜가 바뀔 때마다 그 날짜 거래를 서버에서 가져옴
  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingDay(true);

    fetch(`${API_BASE}/transactions?day=${selectedDate}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("거래 내역을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: any[]) => {
        const dayTransactions = data.map(mapDtoToTransaction);
        // 같은 날짜 데이터는 새로 받아온 것으로 교체하고, 다른 날짜 데이터는 유지
        setTransactions((prev) => [
          ...prev.filter((t) => t.date !== selectedDate),
          ...dayTransactions,
        ]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("일별 거래 내역 로드 실패:", err);
        }
      })
      .finally(() => setIsLoadingDay(false));

    return () => controller.abort();
  }, [selectedDate]);

  // 계좌 / 카드 목록 불러오기
  useEffect(() => {
    fetch(`${API_BASE}/accounts`)
      .then((res) => {
        if (!res.ok) throw new Error("계좌 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: AccountOption[]) => setAccountOptions(data))
      .catch((err) => console.error("계좌 목록 로드 실패:", err));

    fetch(`${API_BASE}/cards`)
      .then((res) => {
        if (!res.ok) throw new Error("카드 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data: CardOption[]) => setCardOptions(data))
      .catch((err) => console.error("카드 목록 로드 실패 (엔드포인트 확인 필요):", err));
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const goToday = () => {
    const today = new Date();
    setWeekStart(getWeekStart(today));
    setSelectedDate(toDateKey(today));
  };

  const dailyTotals = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (!map[t.date]) map[t.date] = { income: 0, expense: 0 };
      if (t.amount >= 0) map[t.date].income += t.amount;
      else map[t.date].expense += Math.abs(t.amount);
    });
    return map;
  }, [transactions]);

  const selectedDayTransactions = useMemo(
    () => transactions.filter((t) => t.date === selectedDate).sort((a, b) => (a.time < b.time ? 1 : -1)),
    [transactions, selectedDate]
  );

  const selectedDayTotal = dailyTotals[selectedDate] ?? { income: 0, expense: 0 };

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const weekRangeLabel = `${weekDates[0].getMonth() + 1}월 ${weekDates[0].getDate()}일 - ${
    weekDates[6].getMonth() + 1
  }월 ${weekDates[6].getDate()}일`;


  const handleAddTransaction = async (input: {
    title: string;
    content: string;
    date: string;
    time: string;
    amount: number; // 부호 포함 (수입 +, 지출 -)
    accountId: number;
    cardId: number;
    categoryId: number;
    categoryName: string;
  }) => {
    const payload = {
      title: input.title,
      content: input.content,
      amount: Math.round(Math.abs(input.amount)),
      transactionType: input.amount >= 0 ? "INCOME" : "EXPENSE",
      transactionDate: `${input.date}T${input.time}:00`,
      accountId: input.accountId,
      cardId: input.cardId,
      categoryId: input.categoryId,
    };

    try {
      const res = await fetch(`${API_BASE}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("거래 추가에 실패했습니다.");

      let saved: { id?: number } | null = null;
      try {
        saved = await res.json();
      } catch {
        saved = null;
      }

      const newTx: Transaction = {
        id: saved?.id ?? Date.now(),
        date: input.date,
        time: input.time,
        title: input.title,
        category: input.categoryName,
        amount: input.amount,
        accountId: input.accountId,
        cardId: input.cardId,
        categoryId: input.categoryId,
      };
      setTransactions((prev) => [...prev, newTx]);
      setSelectedDate(newTx.date);
      setIsAddOpen(false);
    } catch (err) {
      console.error("거래 추가 실패:", err);
      alert("거래 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[#201b14] mb-1">Weekly Transaction History</h3>
          <p className="text-xs text-[#9b8f7c]">Your transactions organized by week</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrevWeek} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0e8d9] transition-colors">
            <span className="material-symbols-outlined text-[#775a1c] text-[20px]">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-[#775a1c] min-w-[140px] text-center">{weekRangeLabel}</span>
          <button onClick={goNextWeek} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0e8d9] transition-colors">
            <span className="material-symbols-outlined text-[#775a1c] text-[20px]">chevron_right</span>
          </button>
          <button
            onClick={goToday}
            className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#775a1c] border border-[#eee4d3] hover:bg-[#f0e8d9] transition-colors"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 주간 달력 */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDates.map((date, i) => {
          const key = toDateKey(date);
          const totals = dailyTotals[key];
          const isSelected = key === selectedDate;
          const isToday = key === toDateKey(new Date());
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                isSelected ? "border-[#775a1c] bg-[#775a1c] shadow-md" : "border-[#eee4d3] bg-[#faf4e9] hover:border-[#775a1c]/40"
              }`}
            >
              <span className={`text-[11px] font-bold ${isSelected ? "text-white/70" : "text-[#9b8f7c]"}`}>
                {weekdayLabels[i]}
              </span>
              <span className={`text-base font-bold ${isSelected ? "text-white" : isToday ? "text-[#775a1c]" : "text-[#201b14]"}`}>
                {date.getDate()}
              </span>
              <div className="flex flex-col items-center gap-0.5 mt-1 min-h-[28px]">
                {totals?.income ? (
                  <span className={`text-[10px] font-bold ${isSelected ? "text-[#c8eeb1]" : "text-[#476737]"}`}>
                    +{totals.income.toLocaleString()}
                  </span>
                ) : null}
                {totals?.expense ? (
                  <span className={`text-[10px] font-bold ${isSelected ? "text-[#ffb596]" : "text-[#924b29]"}`}>
                    -{totals.expense.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 요약 + 거래 추가 버튼 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-[#201b14]">{selectedDate} 거래 내역</p>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-[#476737]">수입 +{selectedDayTotal.income.toLocaleString()}</span>
            <span className="text-[#924b29]">지출 -{selectedDayTotal.expense.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#775a1c] text-white rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          거래 추가
        </button>
      </div>

      {/* 선택된 날짜 거래 리스트 */}
      <div className="border border-[#eee4d3] rounded-2xl p-4 md:p-5 bg-[#faf4e9] space-y-3">
        {isLoadingDay ? (
          <p className="text-sm text-[#9b8f7c] text-center py-6">불러오는 중...</p>
        ) : selectedDayTransactions.length === 0 ? (
          <p className="text-sm text-[#9b8f7c] text-center py-6">해당 날짜의 거래 내역이 없습니다.</p>
        ) : (
          selectedDayTransactions.map((t) => {
            const style = categoryColor[t.category] ?? { bg: "#ddd4c9", color: "#9b8f7c" };
            const icon = categoryIcons[t.category] ?? "receipt_long";
            const isIncome = t.amount >= 0;
            return (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#f0e8d9] hover:border-[#775a1c]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: style.bg }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: style.color }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#201b14]">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#9b8f7c]">{t.time}</span>
                      <span className="text-[11px] text-[#9b8f7c]">·</span>
                      <span className="text-[11px] text-[#9b8f7c]">{t.category}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm font-bold ${isIncome ? "text-[#476737]" : "text-[#924b29]"}`}>
                  {isIncome ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {isAddOpen && (
        <AddTransactionModal
          defaultDate={toDateKey(new Date())}
          accountOptions={accountOptions}
          cardOptions={cardOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          expenseCategoryOptions={expenseCategoryOptions}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}

interface AddTransactionModalProps {
  defaultDate: string;
  accountOptions: AccountOption[];
  cardOptions: CardOption[];
  incomeCategoryOptions: CategoryOption[];
  expenseCategoryOptions: CategoryOption[];
  onClose: () => void;
  onAdd: (input: {
    title: string;
    content: string;
    date: string;
    time: string;
    amount: number;
    accountId: number;
    cardId: number;
    categoryId: number;
    categoryName: string;
  }) => void | Promise<void>;
}

function AddTransactionModal({
  defaultDate,
  accountOptions,
  cardOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onClose,
  onAdd,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");

  // 현재 선택된 타입(수입/지출)에 맞는 카테고리 목록
  const categoryOptions = type === "income" ? incomeCategoryOptions : expenseCategoryOptions;

  const [form, setForm] = useState({
    title: "",
    content: "",
    date: defaultDate,
    time: new Date().toTimeString().slice(0, 5),
    amount: "",
    accountId: "",
    cardId: "",
    categoryId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // document.body는 클라이언트에만 존재하므로, 마운트 이후에만 포탈을 렌더링합니다.
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 계좌/카드 목록이 로드되면 첫 번째 항목을 기본 선택값으로 채워줍니다.
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      accountId: prev.accountId || (accountOptions[0]?.id ? String(accountOptions[0].id) : ""),
      cardId: prev.cardId || (cardOptions[0]?.id ? String(cardOptions[0].id) : ""),
    }));
  }, [accountOptions, cardOptions]);

  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      categoryId: categoryOptions[0]?.id ? String(categoryOptions[0].id) : "",
    }));
  }, [categoryOptions]);

  const isValid =
    !!form.title &&
    !!form.amount &&
    Number(form.amount) > 0 &&
    !!form.accountId &&
    !!form.cardId &&
    !!form.categoryId;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    const numericAmount = Math.abs(Number(form.amount));
    const selectedCategory = categoryOptions.find((c) => String(c.id) === form.categoryId);

    setIsSubmitting(true);
    try {
      await onAdd({
        title: form.title,
        content: form.content,
        date: form.date,
        time: form.time,
        amount: type === "income" ? numericAmount : -numericAmount,
        accountId: Number(form.accountId),
        cardId: Number(form.cardId),
        categoryId: Number(form.categoryId),
        categoryName: selectedCategory?.name ?? "기타",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201b14]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#fef2e6] w-full max-w-[560px] rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#eee4d3] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center px-8 pt-8 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#201b14]">거래 추가</h3>
            <p className="text-xs text-[#867b6a] mt-1">오늘의 수입/지출 내역을 기록하세요.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-[#9b8f7c] hover:bg-[#ece1d5] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex bg-white border border-[#eee4d3] rounded-xl p-1">
            <button onClick={() => setType("expense")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "expense" ? "bg-[#924b29] text-white" : "text-[#9b8f7c]"}`}>지출</button>
            <button onClick={() => setType("income")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "income" ? "bg-[#476737] text-white" : "text-[#9b8f7c]"}`}>수입</button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">항목</label>
            <input type="text" placeholder="예: 점심 식사" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#867b6a] ml-1">메모 (선택)</label>
            <input type="text" placeholder="예: 팀 점심 회식" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">금액</label>
              <input type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">카테고리</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              >
                {categoryOptions.length === 0 && <option value="">불러오는 중...</option>}
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">계좌</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm((prev) => ({ ...prev, accountId: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              >
                {accountOptions.length === 0 && <option value="">등록된 계좌 없음</option>}
                {accountOptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.bank} {a.accountNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">카드</label>
              <select
                value={form.cardId}
                onChange={(e) => setForm((prev) => ({ ...prev, cardId: e.target.value }))}
                className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all"
              >
                {cardOptions.length === 0 && <option value="">등록된 카드 없음</option>}
                {cardOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.cardName ?? c.cardNumber ?? `카드 ${c.id}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">날짜</label>
              <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#867b6a] ml-1">시간</label>
              <input type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} className="w-full bg-white border border-[#eee4d3] rounded-xl py-3 px-4 text-[#201b14] focus:ring-2 focus:ring-[#775a1c]/30 outline-none transition-all" />
            </div>
          </div>
        </div>

        <footer className="px-8 py-6 bg-[#faf4e9] border-t border-[#f0e8d9] flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-3 text-[#867b6a] font-bold rounded-xl hover:bg-[#ece1d5] transition-all">취소</button>
          <button
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-xl font-bold transition-all ${isValid && !isSubmitting ? "bg-[#775a1c] text-white hover:brightness-110 active:scale-[0.98] shadow-md" : "bg-[#ddd4c9] text-[#9b8f7c] cursor-not-allowed"}`}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
