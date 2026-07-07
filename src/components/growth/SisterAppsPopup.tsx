import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import logoMove from "@/assets/smartymove-logo.png";
import logoDiet from "@/assets/smartydiet-logo.png";
import logoGym from "@/assets/smarty-gym-logo.png";

// Change this constant when porting the component to the other two projects.
const CURRENT_APP: "gym" | "move" | "diet" = "gym";

type SisterApp = {
  id: "gym" | "move" | "diet";
  name: string;
  tagline: string;
  url: string;
  image: string;
};

const SISTER_APPS: SisterApp[] = [
  {
    id: "gym",
    name: "SmartyGym",
    tagline: "Train smart. Get stronger. Feel younger.",
    url: "https://smartygym.com",
    image: logoGym,
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

const DELAY_MS = 5000;

export const SisterAppsPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const others = SISTER_APPS.filter((a) => a.id !== CURRENT_APP);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 border-2 border-primary/40 overflow-hidden max-w-2xl w-[92vw] sm:w-[95vw] rounded-2xl bg-card shadow-2xl">
        <div className="p-3 sm:p-6">
          <div className="text-center mb-3 sm:mb-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-3">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Smarty Wellness Family
            </span>
            <h2 className="text-base sm:text-2xl font-bold text-foreground leading-tight">
              Complete your Smarty Wellness journey
            </h2>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              Two more apps designed to work together with {SISTER_APPS.find(a => a.id === CURRENT_APP)?.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {others.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-primary/60 hover:shadow-lg transition-all"
              >
                <div className="aspect-square sm:aspect-[4/3] overflow-hidden bg-white flex items-center justify-center p-4 sm:p-6">
                  <img
                    src={app.image}
                    alt={app.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-foreground">{app.name}</h3>
                  <p className="text-[11px] sm:text-sm text-muted-foreground leading-snug flex-1 line-clamp-3">{app.tagline}</p>
                  <Button
                    size="sm"
                    className="w-full mt-1 sm:mt-2 gap-1.5 font-semibold text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <span className="hidden sm:inline">Visit {app.name}</span>
                    <span className="sm:hidden">Visit</span>
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SisterAppsPopup;