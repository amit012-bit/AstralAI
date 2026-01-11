"use client";

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  showShadow?: boolean;
  sidebarWidth?: number;
}

export function HamburgerMenu({ isOpen, onToggle, onClose, showShadow = false, sidebarWidth = 0 }: HamburgerMenuProps) {
  // Hamburger menu position: 
  // - When sidebar is closed: 24px from viewport left
  // - When sidebar is open: 24px from sidebar right edge (sidebarWidth + 24)
  const leftPosition = sidebarWidth > 0 ? sidebarWidth + 24 : 24; // 24px = 6 * 4 (top-6 equivalent)

  return (
    <>
      {/* Hamburger Menu Button - Position adjusts based on sidebar */}
      <button
        onClick={onToggle}
        className={`fixed top-6 z-50 flex items-center justify-center w-[53px] h-[53px] rounded-full bg-white/80 backdrop-blur-xl border border-zinc-900 transition-all duration-300 hover:bg-white ${
          showShadow ? "shadow-[0_10px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(0,0,0,0.2)]" : ""
        }`}
        style={{
          left: `${leftPosition}px`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transition: "left 0.3s ease-in-out",
        }}
        aria-label="Toggle sidebar menu"
      >
        <div className="flex flex-col items-center justify-center gap-1.5 w-[22px] h-[22px]">
          <span className={`block h-0.5 w-[22px] bg-zinc-900 rounded-full transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`} />
          <span className={`block h-0.5 w-[22px] bg-zinc-900 rounded-full transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`} />
          <span className={`block h-0.5 w-[22px] bg-zinc-900 rounded-full transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`} />
        </div>
      </button>
    </>
  );
}

