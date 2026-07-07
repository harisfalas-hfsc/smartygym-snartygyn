import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import promoMove from "@/assets/promo-smartymove.jpg";
import promoDiet from "@/assets/promo-smartydiet.jpg";

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
    image: promoMove, // placeholder — replaced when this component ports to Move/Diet
  },
  {
    id: "move",
    name: "SmartyMove",
    tagline: "Check your posture. Correct your movement. Live better.",
    url: "https://smarty-motion-pro.lovable.app",
    image: promoMove,
  },
  {
    id: "diet",
    name: "SmartyDiet",
    tagline: "Eat smart. Fuel your body. Live longer.",
    url: "https://smarty-meals-hub.lovable.app",
    image: promoDiet,
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
      <DialogContent className="p-0 border-2 border-primary/40 overflow-hidden max-w-2xl w-[95vw] rounded-2xl bg-card shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Smarty Wellness Family
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              Complete your Smarty Wellness journey
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Two more apps designed to work together with {SISTER_APPS.find(a => a.id === CURRENT_APP)?.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {others.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-primary/60 hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={app.image}
                    alt={app.name}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-lg font-bold text-foreground">{app.name}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{app.tagline}</p>
                  <Button
                    size="sm"
                    className="w-full mt-2 gap-1.5 font-semibold"
                  >
                    Visit {app.name}
                    <ExternalLink className="w-3.5 h-3.5" />
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