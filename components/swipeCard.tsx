/* eslint-disable @next/next/no-img-element */
// components/SwipeCard.tsx
import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface CardProps {
  fact: { id: string; text: string; imageUrl: string };
  onSwipe: (direction: "up" | "down" | "left" | "right") => void;
}

export const SwipeCard = ({ fact, onSwipe }: CardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotate and fade the card as it moves
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-300, -250, 0, 250, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: unknown, info: PanInfo) => {
    const threshold = 150;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else if (info.offset.y > threshold) onSwipe("down");
    else if (info.offset.y < -threshold) onSwipe("up");
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      /* Updated: Added font-sans and optimized height */
      className="absolute w-80 h-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100 flex flex-col font-sans"
    >
      {/* The "In-margin" Container */}
      <div className="p-3 w-full h-3/5">
        <img
          src={fact.imageUrl}
          alt="Fact visual"
          /* Updated: Added rounded corners to the image itself to match the margin feel */
          className="w-full h-full object-cover pointer-events-none rounded-2xl shadow-inner bg-gray-50"
        />
      </div>

      <div className="px-6 py-4 flex flex-col justify-center flex-grow">
        <p className="text-slate-900 text-xl font-semibold leading-snug tracking-tight">
          {fact.text}
        </p>
      </div>
    </motion.div>
  );
};
