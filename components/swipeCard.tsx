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
      className="absolute w-80 h-112.5 bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100"
    >
      <img
        src={fact.imageUrl}
        alt="Fact visual"
        className="w-full h-2/3 object-cover pointer-events-none"
      />
      <div className="p-6">
        <p className="text-gray-800 text-lg font-medium leading-tight">
          {fact.text}
        </p>
      </div>
    </motion.div>
  );
};
