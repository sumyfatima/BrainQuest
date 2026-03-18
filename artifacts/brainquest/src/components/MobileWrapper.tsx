import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileWrapperProps {
  children: ReactNode;
  className?: string;
  isDark?: boolean;
}

export function MobileWrapper({ children, className, isDark = false }: MobileWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen w-full flex justify-center bg-[#e0e5f0] transition-colors duration-500",
      isDark && "bg-black"
    )}>
      <div 
        className={cn(
          "w-full max-w-[430px] min-h-screen relative overflow-hidden flex flex-col shadow-2xl transition-colors duration-500",
          isDark ? "bg-[#0d0d1a] text-white dark" : "bg-[#f5f7ff] text-slate-900",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
