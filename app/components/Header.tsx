import React from 'react';

export default function Header({ onMenuClick, isSidebarOpen }: { onMenuClick?: () => void; isSidebarOpen?: boolean } = {}) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-[#fffdf9]/80 backdrop-blur-md border-b border-[#f0e8d9] flex justify-between items-center px-3 sm:px-4 md:px-6 lg:px-8 z-40">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#f4ead8] rounded-lg transition-colors text-[#775a1c] flex-shrink-0"
        >
          <span className="material-symbols-outlined text-2xl">
            {isSidebarOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8f7c] text-sm">search</span>
          <input className="bg-[#faf4e9] border-none rounded-full py-1.5 pl-10 pr-4 text-xs sm:text-[13.5px] w-40 sm:w-52 md:w-64 focus:ring-2 focus:ring-[#775a1c] outline-none" placeholder="Search insights..." type="text" />
        </div>
        <nav className="hidden lg:flex gap-4 md:gap-6">
          <a className="text-xs md:text-[14px] font-bold text-[#775a1c] border-b-2 border-[#775a1c] pb-1 whitespace-nowrap" href="#">Dashboard</a>
          <a className="text-xs md:text-[14px] font-bold text-[#9b8f7c] hover:text-[#924b29] transition-colors whitespace-nowrap" href="#">Overview</a>
          <a className="text-xs md:text-[14px] font-bold text-[#9b8f7c] hover:text-[#924b29] transition-colors whitespace-nowrap" href="#">Analytics</a>
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0">
        <button className="text-[#867b6a] hover:text-[#775a1c] transition-colors p-1 lg:p-0">
          <span className="material-symbols-outlined text-xl lg:text-2xl">notifications</span>
        </button>
        <button className="hidden sm:block text-[#867b6a] hover:text-[#775a1c] transition-colors p-1 lg:p-0">
          <span className="material-symbols-outlined text-xl lg:text-2xl">dark_mode</span>
        </button>
        <button className="hidden md:block bg-gradient-to-r from-[#d4805a] to-[#c9a45f] px-2 sm:px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap">New Task</button>
        <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full overflow-hidden border-2 border-[#775a1c]/20 flex-shrink-0">
          <img className="h-full w-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_ySOxSymnM8AZBiA56vgTkT93MnZA741OL8Vz071YXizSjt--7O2Lp1Dg2sigECGU-6U9erWdYBUWNhsvN7lu_6ipadzMsP0FguYU4A4y5wSUbiefVCNCyIRyvQjy_E2G5wBDqt4cPfDpRkLyFmaFWvORl_iyNa694gxjiWQNYggr-zZ4JkHZXX3kMJ5_97jDZeALku7Eb4xt4uUm_MUMGNT2U1VBnAvkSkrmDBGccaNX0qMe8-69x6zZ2ZU7x3LpNh_9l8_7P61y" />
        </div>
      </div>
    </header>
  );
}