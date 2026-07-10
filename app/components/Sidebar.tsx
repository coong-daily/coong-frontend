"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/assets", icon: "account_balance", label: "Assets" },
  { href: "/schedule", icon: "calendar_today", label: "Schedule" },
  { href: "/habits", icon: "auto_awesome", label: "Habits" },
  { href: "/diary", icon: "book", label: "Diary" },
];

export default function Sidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#fef2e6] shadow-[0_6px_22px_rgba(150,120,70,0.06)] flex flex-col py-[30px] px-[20px] z-50">
      <div className="mb-10">
        <h1 className="text-[34px] font-bold text-[#775a1c] tracking-tight leading-tight">COONG's DAILY</h1>
      </div>

      <nav className="flex-grow space-y-[7px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-[#f4ead8] text-[#775a1c] font-bold"
                  : "text-[#867b6a] hover:text-[#775a1c] hover:bg-[#f4ead8]/50"
              }`}
            >
              {/* <span className="material-symbols-outlined">{item.icon}</span> */}
              <span className="text-[14.5px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-[7px]">
        <button className="w-full bg-gradient-to-r from-[#d4805a] to-[#c9a45f] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity mb-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span> Quick Entry
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-[#867b6a] hover:text-[#775a1c] hover:bg-[#f4ead8]/50 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[14.5px] font-medium">Settings</span>
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-3 text-[#867b6a] hover:text-[#775a1c] hover:bg-[#f4ead8]/50 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-[14.5px] font-medium">Support</span>
        </Link>
      </div>
    </aside>
  );
}