import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t border-border py-8 px-4 mt-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6">
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/profile.php?id=61579302997368" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" 
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/thesmartygym/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" 
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.tiktok.com/@thesmartygym?lang=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" 
              aria-label="TikTok"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@TheSmartyGym" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" 
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate("/privacypolicy")} 
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => navigate("/termsofservice")} 
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button 
              onClick={() => navigate("/disclaimer")} 
              className="hover:text-primary transition-colors"
            >
              Disclaimer
            </button>
            <span>•</span>
            <button 
              onClick={() => navigate("/contact")} 
              className="hover:text-primary transition-colors"
            >
              Contact
            </button>
          </div>
          
          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground">
            © 2025 SmartyGym - Your Gym Re-imagined. Anywhere, Anytime.
          </p>
        </div>
      </div>
    </footer>
  );
};
