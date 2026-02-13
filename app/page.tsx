/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import { SwipeCard } from "@/components/swipeCard";

export default function Home() {
  const [stack, setStack] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacts = async () => {
    try {
      const res = await fetch("/api/facts");
      const newFacts = await res.json();
      setStack((prev) => [...newFacts, ...prev]);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  const handleSwipe = (direction: string) => {
    setStack((prev) => {
      const newStack = [...prev];
      newStack.pop();
      if (newStack.length <= 2) fetchFacts();
      return newStack;
    });
  };

  if (loading && stack.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="animate-bounce text-blue-600 font-bold">
          Loading Facts...
        </p>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full items-center justify-center bg-lime-800 overflow-hidden">
      <div className="relative w-80 h-[450px] flex items-center justify-center">
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

        {/* Fallback when cards run out */}
        {stack.length === 0 && !loading && (
          <p className="text-white">You have seen them all!</p>
        )}
      </div>
    </main>
  );
}
