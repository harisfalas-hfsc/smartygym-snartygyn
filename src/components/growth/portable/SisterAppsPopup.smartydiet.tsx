// PORTABLE COPY FOR SMARTYDIET PROJECT
// Copy this file into SmartyDiet as: src/components/growth/SisterAppsPopup.tsx
// Also copy these 3 images into SmartyDiet's src/assets/:
//   smartygym-icon.png (from SmartyGym's public/icon-512.png — the brain+barbell PWA icon)
//   smartymove-logo.png, smartydiet-logo.png
// Then in SmartyDiet's src/App.tsx add:
//   import { SisterAppsPopup } from "@/components/growth/SisterAppsPopup";
//   and render <SisterAppsPopup /> inside <BrowserRouter> (before </BrowserRouter>).
import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ChevronLeft } from "lucide-react";
import logoMove from "@/assets/smartymove-logo.png";
import logoDiet from "@/assets/smartydiet-logo.png";
import logoGym from "@/assets/smartygym-icon.png";

const CURRENT_APP: "gym" | "move" | "diet" = "diet";

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
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[60] flex items-center transition-transform duration-700 ease-out ${open ? "translate-x-0" : "-translate-x-[calc(100%+8px)]"}`}
      >
        <aside className="w-[280px] sm:w-[300px] max-h-[calc(100dvh-2rem)] overflow-hidden rounded-r-2xl border border-l-0 border-primary/30 bg-card/70 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
          <div className="p-3.5">
            <div className="mb-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-2.5 h-2.5" /> Smarty Family
              </span>
              <h2 className="text-[13px] font-semibold text-foreground leading-tight">
                Complete your wellness journey
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {others.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-row items-center gap-2.5 rounded-xl border border-border/50 bg-background/60 backdrop-blur p-2 hover:border-primary/50 hover:bg-background/90 transition-all"
                >
                  <div className={`w-11 h-11 shrink-0 rounded-lg overflow-hidden flex items-center justify-center ${app.darkImage ? "bg-[#0F172A] p-1" : "bg-white p-1.5"}`}>
                    <img src={app.image} alt={app.name} loading="lazy" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[12px] font-semibold text-foreground leading-tight">{app.name}</h3>
                    <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{app.tagline}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </aside>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Hide panel"
          className="h-14 w-5 -ml-px rounded-r-lg bg-primary/80 backdrop-blur text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show sister apps"
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[59] w-1 h-20 rounded-r-full bg-primary/40 hover:bg-primary/80 hover:w-2 transition-all duration-300 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />
    </>
  );
};

export default SisterAppsPopup;