import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clampY = useCallback((y: number) => {
    const min = getDefaultTop();
    const max = window.innerHeight - 60;
    return Math.max(min, Math.min(max, y));
  }, [getDefaultTop]);

  useEffect(() => {
    const handleResize = () => {
      setTopY((currentTop) => clampY(currentTop ?? getDefaultTop()));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clampY, getDefaultTop]);

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

  const floatingButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={cn(
              "fixed z-40",
              "rounded-full border border-border/80 bg-background/90 p-1.5 shadow-lg shadow-primary/20 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
              "cursor-grab active:cursor-grabbing",
              "hover:scale-110 transition-transform duration-200",
              "animate-in slide-in-from-right-5 duration-300",
              "smarty-coach-attention motion-reduce:animate-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "touch-none select-none",
              className
            )}
            style={{
              top: topY ?? undefined,
              right: "calc(env(safe-area-inset-right, 0px) + 0.75rem)",
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)",
            }}
            aria-label="Smarty Coach"
          >
            <img src={smartyCoachIcon} alt="Smarty Coach" className="h-11 w-11 rounded-full drop-shadow-md" loading="lazy" width={44} height={44} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Smarty Coach</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {isMounted ? createPortal(floatingButton, document.body) : null}
      <SmartyCoachModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};