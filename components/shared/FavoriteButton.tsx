"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  listingType?: "stay" | "tiffin";
  initialFavorited?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const GUEST_KEY = "staynest_guest_favorites";

export default function FavoriteButton({
  listingId,
  listingType = "stay",
  initialFavorited = false,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with localStorage on mount & events
  useEffect(() => {
    const checkState = () => {
      try {
        const guestList: string[] = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
        if (guestList.includes(listingId)) {
          setIsFavorited(true);
        }
      } catch {}
    };

    checkState();
    window.addEventListener("favorites-updated", checkState);
    return () => window.removeEventListener("favorites-updated", checkState);
  }, [listingId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isFavorited;
    setIsFavorited(nextState);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Update local storage backup
    try {
      const guestList: string[] = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
      let updatedList = [...guestList];
      if (nextState) {
        if (!updatedList.includes(listingId)) updatedList.push(listingId);
      } else {
        updatedList = updatedList.filter((id) => id !== listingId);
      }
      localStorage.setItem(GUEST_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("favorites-updated"));
    } catch {}

    // If logged in, sync with server
    if (token) {
      try {
        if (nextState) {
          await fetch("/api/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId, listingType }),
          });
        } else {
          await fetch(`/api/favorites?listingId=${listingId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.error("Favorite sync error:", err);
      }
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const buttonSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      suppressHydrationWarning
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-md",
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30"
          : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500 hover:scale-105",
        isAnimating && "scale-125",
        buttonSizes[size],
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-colors",
          isFavorited ? "fill-current text-white" : "text-gray-700 hover:text-red-500"
        )}
      />
    </button>
  );
}
