import React from "react";
import { cn } from "../../lib/utils";

interface PaperPanelProps {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "wood";
}

export default function PaperPanel({
  children,
  className,
  tone = "paper",
}: PaperPanelProps) {
  return (
    <div
      className={cn(
        "orn-frame",
        tone === "paper" ? "orn-paper" : "orn-wood",
        className,
      )}
    >
      {children}
    </div>
  );
}
