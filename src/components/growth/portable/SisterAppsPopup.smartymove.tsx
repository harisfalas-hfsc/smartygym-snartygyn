// PORTABLE COPY FOR SMARTYMOVE PROJECT
// Copy this file into SmartyMove as: src/components/growth/SisterAppsPopup.tsx
// Also copy these 3 images into SmartyMove's src/assets/:
//   smartygym-icon.png (from SmartyGym's public/icon-512.png — the brain+barbell PWA icon)
//   smartymove-logo.png, smartydiet-logo.png
// Then in SmartyMove's src/App.tsx add:
//   import { SisterAppsPopup } from "@/components/growth/SisterAppsPopup";
//   and render <SisterAppsPopup /> inside <BrowserRouter> (before </BrowserRouter>).
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
      <aside
        aria-hidden={!open}
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[60] w-[calc(100vw-3rem)] max-w-[380px] sm:max-w-[440px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-r-2xl border border-l-0 border-primary/40 bg-card shadow-2xl transition-transform duration-700 ease-in-out ${open ? "translate-x-0" : "-translate-x-[110%]"}`}
      >
        <div className="p-4 sm:p-5">
          <div className="mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-normal mb-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Smarty Wellness Family
            </span>
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
              Complete your Smarty Wellness journey
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {others.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-row items-center rounded-lg border border-border bg-background overflow-hidden hover:border-primary/60 hover:shadow-lg transition-all"
              >
                <div className={`w-20 h-20 shrink-0 overflow-hidden flex items-center justify-center ${app.darkImage ? "bg-[#0F172A] p-2" : "bg-white p-3"}`}>
                  <img
                    src={app.image}
                    alt={app.name}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-2.5 flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{app.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{app.tagline}</p>
                  <Button size="sm" className="w-full mt-1 gap-1.5 font-semibold text-xs h-7">
                    Visit <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tuck sister apps panel"
          className="absolute top-1/2 -translate-y-1/2 -right-6 w-6 h-16 rounded-r-md bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:brightness-110 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sister apps panel"
        className={`fixed top-1/2 -translate-y-1/2 left-0 z-[59] w-1.5 h-24 rounded-r-md bg-primary/60 hover:bg-primary hover:w-6 transition-all duration-300 flex items-center justify-center text-primary-foreground overflow-hidden ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </>
  );
};

export default SisterAppsPopup;