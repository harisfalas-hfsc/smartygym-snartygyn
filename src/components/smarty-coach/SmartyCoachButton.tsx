import { useState, useRef, useCallback, useEffect } from "react";
import { SmartyCoachModal } from "./SmartyCoachModal";
import { cn } from "@/lib/utils";
import smartyCoachIcon from "@/assets/smarty-coach-icon.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartyCoachButtonProps {
  className?: string;
}

export const SmartyCoachButton = ({ className }: SmartyCoachButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topY, setTopY] = useState<number | null>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTop = useRef(0);
  const hasMoved = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getDefaultTop = useCallback(() => {
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-header-h') || '100');
    return headerH + 8;
  }, []);

  useEffect(() => {
    if (topY === null) setTopY(getDefaultTop());
  }, [topY, getDefaultTop]);

  const clampY = useCallback((y: number) => {
    const min = getDefaultTop();
    const max = window.innerHeight - 60;
    return Math.max(min, Math.min(max, y));
  }, [getDefaultTop]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartTop.current = topY ?? getDefaultTop();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [topY, getDefaultTop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 4) hasMoved.current = true;
    setTopY(clampY(dragStartTop.current + delta));
  }, [clampY]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (!hasMoved.current) {
      setIsOpen(true);
    }
  }, []);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={buttonRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={cn(
                "fixed z-[80]",
                "right-[calc(var(--sar)+0.75rem)]",
                "p-0 border-0 bg-transparent cursor-grab active:cursor-grabbing",
                "hover:scale-110 transition-transform duration-200",
                "animate-in slide-in-from-right-5 duration-300",
                "smarty-coach-attention motion-reduce:animate-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "touch-none select-none",
                className
              )}
              style={{ top: topY ?? undefined }}
              aria-label="Smarty Coach"
            >
              <img src={smartyCoachIcon} alt="Smarty Coach" className="h-12 w-12 drop-shadow-lg rounded-lg" loading="lazy" width={48} height={48} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Smarty Coach</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SmartyCoachModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};