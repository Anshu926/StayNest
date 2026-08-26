"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  listingId: string;
  listingType?: "stay" | "tiffin";
  initialSaved?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const GUEST_SAVED_KEY = "nagpurnest_guest_saved";

export default function SaveButton({
  listingId,
  listingType = "stay",
  initialSaved = false,
  className,
  size = "md",
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with localStorage on mount & events
  useEffect(() => {
    const checkState = () => {
      try {
        const guestList: string[] = JSON.parse(localStorage.getItem(GUEST_SAVED_KEY) || "[]");
        if (guestList.includes(listingId)) {
          setIsSaved(true);
        }
      } catch {}
    };

    checkState();
    window.addEventListener("saved-updated", checkState);
    return () => window.removeEventListener("saved-updated", checkState);
  }, [listingId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isSaved;
    setIsSaved(nextState);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Update local storage backup
    try {
      const guestList: string[] = JSON.parse(localStorage.getItem(GUEST_SAVED_KEY) || "[]");
      let updatedList = [...guestList];
      if (nextState) {
        if (!updatedList.includes(listingId)) updatedList.push(listingId);
      } else {
        updatedList = updatedList.filter((id) => id !== listingId);
      }
      localStorage.setItem(GUEST_SAVED_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("saved-updated"));
    } catch {}

    // If logged in, sync with server
    if (token) {
      try {
        if (nextState) {
          await fetch("/api/saved", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId, listingType }),
          });
        } else {
          await fetch(`/api/saved?listingId=${listingId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.error("Save sync error:", err);
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
      onClick={toggleSave}
      suppressHydrationWarning
      aria-label={isSaved ? "Remove from saved collection" : "Bookmark / Save listing"}
      title={isSaved ? "Saved to Collection (Click to remove)" : "Save to Collection"}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-md",
        isSaved
          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30"
          : "bg-white/90 text-gray-700 hover:bg-white hover:text-amber-500 hover:scale-105 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-amber-400",
        isAnimating && "scale-125",
        buttonSizes[size],
        className
      )}
    >
      <Bookmark
        className={cn(
          iconSizes[size],
          "transition-colors",
          isSaved ? "fill-current text-white" : "text-gray-700 dark:text-slate-200 hover:text-amber-500"
        )}
      />
    </button>
  );
}
