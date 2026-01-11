"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface ScrollableGridProps {
  children: React.ReactNode;
}

export interface ScrollableGridRef {
  scrollToSearchBar: () => void;
}

export const ScrollableGrid = forwardRef<ScrollableGridRef, ScrollableGridProps>(({ children }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSearchBar = () => {
    if (containerRef.current) {
      const searchBarElement = document.getElementById("search-bar-card");
      if (searchBarElement && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const searchBarRect = searchBarElement.getBoundingClientRect();
        
        const scrollTop = 
          searchBarElement.offsetTop - 
          containerRef.current.offsetTop - 
          (containerRef.current.clientHeight / 2) + 
          (searchBarRect.height / 2);
        
        containerRef.current.scrollTop = Math.max(0, scrollTop);
      } else {
        const scrollHeight = containerRef.current.scrollHeight;
        const clientHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTop = (scrollHeight - clientHeight) / 2;
      }
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToSearchBar,
  }));

  useEffect(() => {
    // Don't auto-scroll on initial load - search bar should be visible immediately
    // Only scroll when explicitly called (e.g., when search match is found)
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-0"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
});

ScrollableGrid.displayName = "ScrollableGrid";

