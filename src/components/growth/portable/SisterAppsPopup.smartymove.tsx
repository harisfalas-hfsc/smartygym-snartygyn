// PORTABLE COPY FOR SMARTYMOVE PROJECT
// Copy this file into SmartyMove as: src/components/growth/SisterAppsPopup.tsx
// Also copy these 3 images into SmartyMove's src/assets/:
//   smartygym-icon.png (from SmartyGym's public/icon-512.png — the brain+barbell PWA icon)
//   smartymove-logo.png, smartydiet-logo.png
// Then in SmartyMove's src/App.tsx add:
//   import { SisterAppsPopup } from "@/components/growth/SisterAppsPopup";
//   and render <SisterAppsPopup /> inside <BrowserRouter> (before </BrowserRouter>).
import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ChevronLeft } from "lucide-react";
import logoMove from "@/assets/smartymove-logo.png";
import logoDiet from "@/assets/smartydiet-logo.png";
import logoGym from "@/assets/smartygym-icon.png";

const CURRENT_APP: "gym" | "move" | "diet" = "move";

type SisterApp = {
  id: "gym" | "move" | "diet";
  name: string;
  tagline: string;
  url: string;
  image: string;
  darkImage?: boolean;
};

const SISTER_APPS: SisterApp[] = [
  {
    id: "gym",
    name: "SmartyGym",
    tagline: "Train smart. Get stronger. Feel younger.",
    url: "https://smartygym.com",
    image: logoGym,
    darkImage: true,
  },
  {
    id: "move",
    name: "SmartyMove",
    tagline: "Check your posture. Correct your movement. Live better.",
    url: "https://smarty-motion-pro.lovable.app",
    image: logoMove,
  },
  {
    id: "diet",
    name: "SmartyDiet",
    tagline: "Eat smart. Fuel your body. Live longer.",
    url: "https://smarty-meals-hub.lovable.app",
    image: logoDiet,
  },
];

const DELAY_MS = 10000;

export const SisterAppsPopup = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setMounted(true);
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const others = SISTER_APPS.filter((a) => a.id !== CURRENT_APP);

  if (!mounted) return null;

  return (
    <>
      <div
        aria-hidden={!open}
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[60] flex items-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "-translate-x-[calc(100%+10px)]"}`}
      >
        <aside className="w-[260px] pl-4 pr-2 py-4">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-primary text-[11px] font-extrabold uppercase tracking-[0.2em] [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Smarty Family
            </span>
            <h2 className="mt-1 text-[15px] font-bold text-white leading-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
              Complete your wellness journey
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {others.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-1 transition-transform duration-300 hover:translate-x-1 focus-visible:outline-none"
              >
                <div className="h-14 w-14 shrink-0 flex items-center justify-center drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-110">
                  <img src={app.image} alt={app.name} loading="lazy" className={`max-w-full max-h-full object-contain ${app.darkImage ? "rounded-2xl" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-white leading-tight group-hover:text-primary transition-colors [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">{app.name}</h3>
                  <p className="text-[11px] font-medium text-white/90 leading-snug line-clamp-2 mt-0.5 [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">{app.tagline}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" />
              </a>
            ))}
          </div>
        </aside>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide panel"
          className="h-12 w-6 rounded-r-full bg-transparent text-primary flex items-center justify-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show sister apps"
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[59] w-2 h-24 rounded-r-full bg-primary/45 shadow-[0_0_28px_hsl(var(--primary)/0.65)] hover:w-3 hover:bg-primary/80 transition-all duration-300 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />
    </>
  );
};

export default SisterAppsPopup;