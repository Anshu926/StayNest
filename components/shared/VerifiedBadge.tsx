import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function VerifiedBadge({ isVerified, size = "sm", className }: VerifiedBadgeProps) {
  if (!isVerified) return null;
  return (
    <span
      className={cn(
        "verified-badge",
        size === "md" && "text-sm px-3 py-1",
        className
      )}
    >
      <CheckCircle2 className={cn("w-3 h-3", size === "md" && "w-3.5 h-3.5")} />
      Verified
    </span>
  );
}
