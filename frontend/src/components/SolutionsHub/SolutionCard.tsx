"use client";

import { useRouter } from "next/router";

interface SolutionCardProps {
  id: string;
  title: string;
  description: string;
  category?: string;
  cols: number;
  rows: number;
  isBlank?: boolean;
}

export function SolutionCard({ id, title, description, category, cols, rows, isBlank = false }: SolutionCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (!isBlank && router) {
      router.push(`/solutions/${id}`).catch((err) => {
        console.error('Navigation error:', err);
      });
    }
  };
  
  // Ensure cols doesn't exceed 4 (1/3 of 12 columns = max width)
  const maxCols = Math.min(cols, 4);
  // Max height is 33.33vh (1/3 of viewport height)
  const isLarge = maxCols >= 3 || rows >= 2;
  
  return (
    <article
      data-cols={maxCols}
      onClick={handleClick}
      className={`group relative flex flex-col border bg-transparent p-6 transition-all duration-500 ${
        isBlank 
          ? "border-gray-900 focus:outline-none focus:ring-0 active:outline-none" 
          : `border-gray-900 ${isLarge 
            ? "hover:bg-white/20 hover:backdrop-blur-md cursor-pointer" 
            : "hover:bg-white/15 hover:backdrop-blur-md cursor-pointer"}`
      }`}
      tabIndex={isBlank ? -1 : 0}
      style={{
        gridColumn: `span ${maxCols}`,
        gridRow: `span ${rows}`,
        width: "100%",
        height: "100%",
        minHeight: "100%",
        margin: "-1px 0 0 -1px",
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      <div className="flex flex-col h-full">
        {!isBlank && (
          <>
            {category && (
              <span className="mb-3 shrink-0 inline-block w-fit rounded-full bg-transparent border border-gray-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-300 transition-colors group-hover:bg-white/20 group-hover:backdrop-blur-sm">
                {category}
              </span>
            )}
            <h3 className={`mb-3 shrink-0 font-semibold leading-tight text-white transition-all group-hover:text-gray-200 ${
              isLarge ? "text-2xl" : "text-xl"
            }`}>
              {title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-gray-300 break-words overflow-wrap-anywhere">{description}</p>
          </>
        )}
      </div>
      {!isBlank && (
        <>
          <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-12 translate-y-12 bg-gradient-to-br from-white/20 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Arrow Icon - Appears on Hover */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}
    </article>
  );
}

