"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { SolutionCard } from "./SolutionCard";
import { SearchBarCard } from "./SearchBarCard";
import { ScrollableGrid, ScrollableGridRef } from "./ScrollableGrid";
import { HamburgerMenu } from "./HamburgerMenu";
import { useSolutions } from "@/hooks/useSolutions";
import Sidebar from "@/components/Layout/Sidebar";
import { chatApi, ChatResponse, SolutionCard as AISolutionCard } from "@/lib/chatApi";
import { toast } from "react-hot-toast";

interface CardData {
  id: string;
  title: string;
  description: string;
  category?: string;
  cols: number;
  rows: number;
}

// Generate random grid dimensions for visual variety (uneven sizes)
const generateGridDimensions = (index: number): { cols: number; rows: number } => {
  const patterns = [
    { cols: 2, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 1 },
    { cols: 2, rows: 2 },
    { cols: 4, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 2 },
    { cols: 2, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 4, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 1 },
    { cols: 2, rows: 2 },
    { cols: 2, rows: 1 },
    { cols: 4, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 2 },
    { cols: 2, rows: 1 },
    { cols: 4, rows: 1 },
    { cols: 2, rows: 2 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 4, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 3, rows: 2 },
    { cols: 2, rows: 1 },
  ];
  return patterns[index % patterns.length];
};

// Calculate total grid positions needed to fill screen
// We want enough positions to fill the viewport height
const calculateTotalGridPositions = (): number => {
  // Estimate: each row is approximately 33.33vh / 2 = ~16.67vh
  // For a full screen, we need approximately 6-8 rows
  // Each row can have 6-12 grid items (depending on column spans)
  // Let's generate enough for 8-10 rows with average 8 items per row = ~80 positions
  // But we'll make it dynamic based on viewport
  if (typeof window !== 'undefined') {
    const vh = window.innerHeight;
    const estimatedRowHeight = vh / 6; // 6 rows visible
    const rowsNeeded = Math.ceil(vh / estimatedRowHeight) + 2; // Extra rows for scrolling
    const itemsPerRow = 6; // Average items per row
    return Math.max(60, rowsNeeded * itemsPerRow); // Minimum 60, adjust based on screen
  }
  return 80; // Default fallback
};

export function SolutionsGrid() {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>([]);
  const [originalCards, setOriginalCards] = useState<CardData[]>([]); // Store original cards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bestMatch, setBestMatch] = useState<CardData | null>(null);
  const [matchedSolutions, setMatchedSolutions] = useState<CardData[]>([]);
  const [hasNoMatch, setHasNoMatch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAISearchActive, setIsAISearchActive] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const scrollContainerRef = useRef<ScrollableGridRef>(null);

  const EXPANDED_SIDEBAR_WIDTH = 208;
  const COLLAPSED_SIDEBAR_WIDTH = 64;
  // Sidebar is completely hidden when closed, only shows when opened
  const sidebarWidth = isSidebarOpen ? EXPANDED_SIDEBAR_WIDTH : 0;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch solutions from API
  const { data: solutionsData, isLoading } = useSolutions({
    limit: 100, // Get enough solutions for the grid
  });

  useEffect(() => {
    if (solutionsData?.solutions) {
      const formattedCards: CardData[] = solutionsData.solutions.map((solution: any, index: number) => {
        const { cols, rows } = generateGridDimensions(index);
        return {
          id: solution._id || solution.id,
          title: solution.title || "Untitled Solution",
          description: solution.description || solution.shortDescription || "",
          category: solution.category,
          cols,
          rows,
        };
      });
      setCards(formattedCards);
      setOriginalCards(formattedCards); // Store original cards
      setLoading(false);
    } else if (!isLoading && !solutionsData) {
      setError("Failed to load solutions");
      setLoading(false);
    }
  }, [solutionsData, isLoading]);

  // Generate empty placeholder cards to fill the screen
  const generatePlaceholderCards = (count: number, startIndex: number): CardData[] => {
    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      const { cols, rows } = generateGridDimensions(index);
      return {
        id: `placeholder-${index}`,
        title: "",
        description: "",
        category: undefined,
        cols,
        rows,
      };
    });
  };

  // Search logic: find best match and position it near search bar
  // Skip this if AI search is active (we show AI results instead)
  useEffect(() => {
    if (isAISearchActive) {
      return; // Don't run local search matching when AI search is active
    }

    if (searchQuery.trim() === "") {
      setBestMatch(null);
      setHasNoMatch(false);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      setBestMatch(null);
      setHasNoMatch(false);
      return;
    }

    // Find all matching solutions with their scores
    const matchesWithScores: Array<{ card: CardData; score: number }> = [];

    cards.forEach((card) => {
      const titleLower = card.title.toLowerCase();
      const descLower = card.description.toLowerCase();
      const categoryLower = card.category?.toLowerCase() || "";

      // Calculate match score
      let score = 0;

      // Exact title match gets highest score
      if (titleLower === searchLower) {
        score = 1000;
      } else if (titleLower.includes(searchLower)) {
        score = 500;
      } else {
        // Check if all search terms are in title
        const allTermsInTitle = searchTerms.every((term) => titleLower.includes(term));
        if (allTermsInTitle) {
          score = 300;
        } else {
          // Check individual terms
          searchTerms.forEach((term) => {
            if (titleLower.includes(term)) {
              score += 100;
            }
            if (descLower.includes(term)) {
              score += 50;
            }
            if (categoryLower.includes(term)) {
              score += 75;
            }
          });
        }
      }

      // Only include matches with score >= 100 (at least one term found in title)
      if (score >= 100) {
        matchesWithScores.push({ card, score });
      }
    });

    // Sort matches by score (highest first)
    matchesWithScores.sort((a, b) => b.score - a.score);

    if (matchesWithScores.length > 0) {
      const allMatches = matchesWithScores.map(m => m.card);
      setBestMatch(allMatches[0]); // Keep best match for compatibility
      setMatchedSolutions(allMatches); // Store all matches
      setHasNoMatch(false);
      
      // Scroll to search bar after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollToSearchBar();
        }
      }, 100);
    } else {
      setBestMatch(null);
      setMatchedSolutions([]);
      setHasNoMatch(true);
    }
  }, [searchQuery, cards, isAISearchActive]);

  // Calculate total grid positions needed
  const [totalGridPositions, setTotalGridPositions] = useState(80);
  
  useEffect(() => {
    const updateGridPositions = () => {
      if (typeof window !== 'undefined') {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        // Estimate rows needed: each row is ~16.67vh (33.33vh / 2)
        const estimatedRowHeight = vh / 6;
        const rowsNeeded = Math.ceil(vh / estimatedRowHeight) + 3; // Extra rows for scrolling
        // Estimate items per row based on average column span (2.5 columns average)
        const itemsPerRow = Math.floor(vw / (vw / 12 * 2.5)); // 12 columns, avg 2.5 cols per item
        const calculated = Math.max(60, rowsNeeded * Math.max(4, itemsPerRow));
        setTotalGridPositions(calculated);
      }
    };
    
    updateGridPositions();
    window.addEventListener('resize', updateGridPositions);
    return () => window.removeEventListener('resize', updateGridPositions);
  }, []);

  // Search bar position: Place it after exactly 1 grid space (1 card above it)
  // Position 2 ensures at least 1 card appears before the search bar in the grid
  const SEARCH_BAR_POSITION = 2;

  // Calculate distance from search bar for each card position
  const getCardDistance = (index: number): number => {
    if (index < SEARCH_BAR_POSITION) {
      return SEARCH_BAR_POSITION - index;
    } else {
      return index - SEARCH_BAR_POSITION + 1;
    }
  };

  // Create a map to assign card content to positions
  const positionToCardMap = new Map<number, CardData | null>();
  
  if (searchQuery.trim() === "" || !bestMatch) {
    // No search: Fill positions around search bar with solutions first, then placeholders
    // Calculate distance from search bar for each position
    const positionsWithDistance = Array.from({ length: totalGridPositions }, (_, index) => ({
      index,
      distance: getCardDistance(index)
    })).sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)
    
    // Fill positions starting from closest to search bar
    let solutionIndex = 0;
    positionsWithDistance.forEach(({ index }) => {
      // Skip the search bar position
      if (index === SEARCH_BAR_POSITION) {
        return;
      }
      
      // Fill with solution cards first (closest positions)
      if (solutionIndex < cards.length) {
        positionToCardMap.set(index, cards[solutionIndex]);
        solutionIndex++;
      } else {
        // Fill remaining positions with placeholders (farther positions)
        const placeholderIndex = index;
        const { cols, rows } = generateGridDimensions(placeholderIndex);
        positionToCardMap.set(index, {
          id: `placeholder-${placeholderIndex}`,
          title: "",
          description: "",
          category: undefined,
          cols,
          rows,
        });
      }
    });
  } else {
    // Search active with matches: position all matching solutions near search bar, then fill surrounding positions
    // Calculate distance from search bar for each position
    const positionsWithDistance = Array.from({ length: totalGridPositions }, (_, index) => ({
      index,
      distance: getCardDistance(index)
    })).sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)
    
    // Get all matching solution IDs
    const matchedIds = new Set(matchedSolutions.map(card => card.id));
    
    // Get non-matching solution cards
    const nonMatchingCards = cards.filter(card => !matchedIds.has(card.id));
    
    // Place all matching solutions starting from closest position to search bar
    let matchIndex = 0;
    positionsWithDistance.forEach(({ index }) => {
      // Skip search bar position
      if (index === SEARCH_BAR_POSITION) {
        return;
      }
      
      // Place matching solutions first (closest positions)
      if (matchIndex < matchedSolutions.length) {
        positionToCardMap.set(index, matchedSolutions[matchIndex]);
        matchIndex++;
      }
    });
    
    // Fill remaining positions with non-matching cards, then placeholders
    let nonMatchIndex = 0;
    positionsWithDistance.forEach(({ index }) => {
      // Skip search bar position and already filled positions
      if (index === SEARCH_BAR_POSITION || positionToCardMap.has(index)) {
        return;
      }
      
      // Fill with non-matching solution cards
      if (nonMatchIndex < nonMatchingCards.length) {
        positionToCardMap.set(index, nonMatchingCards[nonMatchIndex]);
        nonMatchIndex++;
      } else {
        // Fill remaining positions with placeholders (farther positions)
        const { cols, rows } = generateGridDimensions(index);
        positionToCardMap.set(index, {
          id: `placeholder-${index}`,
          title: "",
          description: "",
          category: undefined,
          cols,
          rows,
        });
      }
    });
  }

  if (loading) {
    return (
      <main className="fixed inset-0 bg-white overflow-hidden flex items-center justify-center" style={{ width: "100vw", height: "100vh" }}>
        <div className="text-zinc-600">Loading solutions...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="fixed inset-0 bg-white overflow-hidden flex items-center justify-center" style={{ width: "100vw", height: "100vh" }}>
        <div className="text-red-600">Error: {error}</div>
      </main>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Convert AI solution cards to CardData format
  const convertAISolutionsToCards = (aiSolutions: AISolutionCard[]): CardData[] => {
    return aiSolutions.map((solution, index) => {
      const { cols, rows } = generateGridDimensions(index);
      return {
        id: solution.id,
        title: solution.title || "Untitled Solution",
        description: solution.shortDescription || "",
        category: solution.category,
        cols,
        rows,
      };
    });
  };

  // Handle search submit - query AI agent and display results in grid
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return;

    setIsAILoading(true);
    setIsAISearchActive(true);
    
    try {
      // Generate a session ID for this search
      const sessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send query to AI agent
      const response: ChatResponse = await chatApi.sendMessage(query.trim(), sessionId);
      
      if (response.success && response.data?.solutionCards && response.data.solutionCards.length > 0) {
        // Convert AI solution cards to CardData format
        const aiCards = convertAISolutionsToCards(response.data.solutionCards);
        setCards(aiCards);
        
        // Clear the search query matching logic since we're showing AI results
        setBestMatch(null);
        setMatchedSolutions([]);
        setHasNoMatch(false);
        
        // Show success message
        const { solutionsFound } = response.data.context || {};
        if (solutionsFound > 0) {
          toast.success(`Found ${solutionsFound} relevant solution${solutionsFound > 1 ? 's' : ''} based on your query`);
        }
      } else {
        // No solutions found from AI
        setCards([]);
        setHasNoMatch(true);
        toast.error('No relevant solutions found. Try a different search query.');
      }
    } catch (error: any) {
      console.error('Error searching with AI agent:', error);
      toast.error('Failed to search with AI agent. Please try again.');
      // On error, show original cards
      setCards(originalCards);
      setIsAISearchActive(false);
    } finally {
      setIsAILoading(false);
    }
  };

  // Handle search change - if user clears search, restore original cards
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // If search is cleared and AI search was active, restore original cards
    if (value.trim() === "" && isAISearchActive) {
      setCards(originalCards);
      setIsAISearchActive(false);
      setHasNoMatch(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden" style={{ width: "100vw", height: "100vh" }}>
      {/* Sidebar - Only visible when opened */}
      {isSidebarOpen && (
        <>
          <Sidebar 
            isCollapsed={false} 
            onToggle={toggleSidebar}
            expandedWidth={EXPANDED_SIDEBAR_WIDTH}
            collapsedWidth={COLLAPSED_SIDEBAR_WIDTH}
          />
          
          {/* Mobile Overlay */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Hamburger Menu - Always visible at viewport left edge */}
      <HamburgerMenu 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        onClose={() => setIsSidebarOpen(false)}
        showShadow={true}
        sidebarWidth={sidebarWidth}
      />

      {/* Main Content Area - Full width when sidebar is closed */}
      <main 
        className="fixed inset-0 bg-white transition-all duration-300" 
        style={{ 
          left: `${sidebarWidth}px`,
          width: `calc(100vw - ${sidebarWidth}px)`,
          height: "100vh",
          margin: 0, 
          padding: 0, 
          overflow: "hidden", 
          position: "relative" 
        }}
      >
        <ScrollableGrid ref={scrollContainerRef}>
        <div
          className="solutions-grid grid border-t border-l border-r border-b border-zinc-600 p-0 m-0"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "minmax(calc(33.33vh / 2), auto)",
            gridAutoFlow: "row dense",
            gap: 0,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            alignContent: "start",
            overflow: "visible",
          }}
        >
          {/* Cards before search bar */}
          {Array.from({ length: SEARCH_BAR_POSITION }, (_, index) => {
            const assignedCard = positionToCardMap.get(index);
            const isBlank = !assignedCard || assignedCard.id.startsWith('placeholder') || assignedCard.title === "";
            const gridDims = assignedCard ? { cols: assignedCard.cols, rows: assignedCard.rows } : generateGridDimensions(index);
            
            return (
              <SolutionCard
                key={`card-${index}`}
                id={assignedCard?.id ?? `empty-${index}`}
                title={assignedCard?.title ?? ""}
                description={assignedCard?.description ?? ""}
                category={assignedCard?.category}
                cols={gridDims.cols}
                rows={gridDims.rows}
                isBlank={isBlank}
              />
            );
          })}

          {/* Search bar card - integrated in grid, spans 8 columns, 1 row, centered at top */}
          <SearchBarCard 
            cols={8} 
            rows={1} 
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            noMatchMessage={hasNoMatch || isAILoading}
          />

          {/* Cards after search bar */}
          {Array.from({ length: totalGridPositions - SEARCH_BAR_POSITION - 1 }, (_, i) => {
            const positionIndex = i + SEARCH_BAR_POSITION + 1;
            const assignedCard = positionToCardMap.get(positionIndex);
            const isBlank = !assignedCard || assignedCard.id.startsWith('placeholder') || assignedCard.title === "";
            const gridDims = assignedCard ? { cols: assignedCard.cols, rows: assignedCard.rows } : generateGridDimensions(positionIndex);
            
            return (
              <SolutionCard
                key={`card-${positionIndex}`}
                id={assignedCard?.id ?? `empty-${positionIndex}`}
                title={assignedCard?.title ?? ""}
                description={assignedCard?.description ?? ""}
                category={assignedCard?.category}
                cols={gridDims.cols}
                rows={gridDims.rows}
                isBlank={isBlank}
              />
            );
          })}
        </div>
      </ScrollableGrid>
      </main>
    </div>
  );
}

