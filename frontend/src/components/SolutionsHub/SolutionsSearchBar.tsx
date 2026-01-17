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
      {/* Single container with input and button inside */}
      <div className="relative flex items-center rounded-full border border-gray-300 bg-white px-4 py-3 focus-within:outline-none">
        {/* Input Field */}
        <input
          id="solutions-search"
          type="search"
          placeholder="I'm looking for AI solutions that automate medical diagnostics..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-0 bg-transparent pr-3 text-base font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
        {/* AI Search Button Inside - Full Height */}
        <button
          type="button"
          aria-label="AI Search"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex h-full items-center gap-2 rounded-full bg-gray-700 px-6 py-3 text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
        >
          {/* Magic Wand Icon with Stars */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {/* Wand stick */}
            <line x1="4" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" />
            {/* Star tip with sparks */}
            <path d="M17 12l5-2-5-2" fill="none" stroke="currentColor" />
            <path d="M17 12l5 2-5 2" fill="none" stroke="currentColor" />
            <circle cx="20" cy="8" r="1" fill="currentColor" />
            <circle cx="20" cy="12" r="1" fill="currentColor" />
            <circle cx="20" cy="16" r="1" fill="currentColor" />
            <path d="M22 10l1-1m-1 1l1 1" stroke="currentColor" />
            <path d="M22 14l1-1m-1 1l1 1" stroke="currentColor" />
          </svg>
          <span className="text-base font-medium uppercase">AI Search</span>
        </button>
      </div>
    </div>
  );
}

