"use client";

import { useEffect, useState } from "react";

interface WhatsAppButtonProps {
  whatsapp: string;
  listingName: string;
  providerId?: string;
}

export default function WhatsAppButton({ whatsapp, listingName, providerId }: WhatsAppButtonProps) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const userId = u._id || u.id || null;
        setIsOwner(Boolean(userId && providerId && userId.toString() === providerId.toString()));
      } else {
        setIsOwner(false);
      }
    } catch {
      setIsOwner(false);
    }
  }, [providerId]);

  // Do not render until owner status is known (avoid flash), hide for owners
  if (isOwner === null || isOwner) return null;

  return (
    <a
      href={`https://wa.me/91${whatsapp}?text=Hi, I saw your listing "${listingName}" on StayNest and I'm interested.`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
    >
      💬 Chat on WhatsApp
    </a>
  );
}
