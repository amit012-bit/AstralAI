interface SolutionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export function SolutionsSearchBar({ value, onChange, onSubmit }: SolutionsSearchBarProps) {
  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && onSubmit) {
      e.preventDefault();
      onSubmit(value.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center gap-4 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-4 shadow-[0_15px_40px_-20px_rgba(15,23,42,0.4)]">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50"
        >
          +
        </button>
        <input
          id="solutions-search"
          type="search"
          placeholder="Search your health care solutions"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent text-lg font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:border-0"
          style={{ 
            outline: 'none',
            border: 'none'
          }}
          onFocus={(e) => {
            e.target.style.outline = '2px solid black';
            e.target.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.target.style.outline = 'none';
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Voice search"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Search submit"
            onClick={handleSubmit}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

