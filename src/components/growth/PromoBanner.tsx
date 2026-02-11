import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const STORAGE_KEY = "smarty_promo_banner_dismissed";

interface PromoBannerData {
  id: string;
  title: string;
  link_url: string;
  link_text: string;
  bg_color: string;
}

export function PromoBanner() {
  const [banner, setBanner] = useState<PromoBannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedId = localStorage.getItem(STORAGE_KEY);

    supabase
      .from("promo_banners")
      .select("id, title, link_url, link_text, bg_color")
      .eq("is_active", true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const b = data[0];
          // If user dismissed this specific banner, don't show
          if (dismissedId === b.id) {
            setDismissed(true);
          } else {
            setBanner(b);
          }
        }
      });
  }, []);

  if (!banner || dismissed) return null;

  return (
    <div
      className="w-full text-white text-center text-sm py-2 px-4 relative z-[60]"
      style={{ backgroundColor: banner.bg_color }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span>{banner.title}</span>
        <Link
          to={banner.link_url}
          className="font-bold underline hover:no-underline whitespace-nowrap"
        >
          {banner.link_text}
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, banner.id);
            setDismissed(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
