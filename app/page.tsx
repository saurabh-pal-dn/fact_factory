/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { SwipeCard } from "@/components/swipeCard";

export default function Home() {
  const [stack, setStack] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use a ref to prevent duplicate fetches in React Strict Mode
  const isFetching = useRef(false);

  const fetchFacts = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const res = await fetch("/api/facts");
      if (!res.ok) throw new Error("Network response was not ok");

      const newFacts = await res.json();

      // Update state once to avoid multiple render triggers
      setStack((prev) => [...newFacts, ...prev]);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial mount fetch
  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  const handleSwipe = () => {
    setStack((prev) => {
      const newStack = [...prev];
      newStack.pop();
      // Threshold check for background fetching
      if (newStack.length <= 3 && !isFetching.current) {
        fetchFacts();
      }
      return newStack;
    });
  };

  // 1. Loading State
  if (isLoading && stack.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-lime-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-lime-200 font-medium">Preparing your facts...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-full items-center justify-center pt-2 bg-lime-800 overflow-hidden">
      <div className="mb-2 -mt-16 pointer-events-none select-none">
        <img
          src="/dyk.png"
          alt="Did You Know?"
          className="w-32 md:w-56 h-auto drop-shadow-2xl"
        />
      </div>
      <div className="relative w-76 h-[480px] flex items-start justify-center mt-2">
        {stack.map((fact, index) => (
          <SwipeCard
            key={fact.id}
            fact={{
              id: fact.id,
              text: fact.fact_text,
              imageUrl: fact.image_url,
            }}
            style={{ zIndex: index }}
            onSwipe={handleSwipe}
          />
        ))}

        {/* 2. Empty State */}
        {stack.length === 0 && !isLoading && (
          <div className="text-center p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-white text-lg font-medium">
              Knowledge cycle complete!
            </p>
            <button
              onClick={() => fetchFacts()}
              className="mt-4 px-6 py-2 bg-green-900 text-white rounded-full font-bold hover:bg-green-700 transition-colors"
            >
              Get more facts!
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
