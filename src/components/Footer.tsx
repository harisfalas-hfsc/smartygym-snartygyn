import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
export const Footer = () => {
  const navigate = useNavigate();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  return <footer className={`bg-background border-t border-border mt-auto ${isMobile ? 'py-4 px-4' : 'py-8 px-4'}`}>
      <div className="container mx-auto max-w-7xl">
        {isMobile ?
      // Mobile: Compact Footer
      <div className="flex flex-col items-center gap-3">
            {/* Social media in one row */}
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=61579302997368" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/thesmartygym/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@thesmartygym?lang=en" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="TikTok">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@TheSmartyGym" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>

            {/* Contact + Legal in one row */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <button onClick={() => navigate("/human-performance")} className="hover:text-primary transition-colors">
                Why SmartyGym?
              </button>
              <span>•</span>
              <button onClick={() => navigate("/corporate")} className="hover:text-primary transition-colors">
                Smarty Corporate
              </button>
              <span>•</span>
              <button onClick={() => navigate("/corporate-wellness")} className="hover:text-primary transition-colors">
                Why Corporate Wellness?
              </button>
              <span>•</span>
              <button onClick={() => navigate("/privacy-policy")} className="hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => navigate("/termsofservice")} className="hover:text-primary transition-colors">
                Terms of Service
              </button>
              <span>•</span>
              <button onClick={() => navigate("/disclaimer")} className="hover:text-primary transition-colors">
                Disclaimer
              </button>
              <span>•</span>
              <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                Contact
              </button>
            </div>

            {/* Copyright */}
            <p className="text-center text-xs text-muted-foreground">
              © 2025 <span className="text-primary font-semibold">SmartyGym</span>
            </p>
          </div> :
      // Desktop: Original Footer
      <div className="flex flex-col items-center gap-6">
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/profile.php?id=61579302997368" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/thesmartygym/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.tiktok.com/@thesmartygym?lang=en" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="TikTok">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@TheSmartyGym" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
          
          {/* Email Subscription FAQ Button */}
          
          
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <button onClick={() => navigate("/human-performance")} className="hover:text-primary transition-colors">
              Why SmartyGym?
            </button>
            <span>•</span>
            <button onClick={() => navigate("/corporate")} className="hover:text-primary transition-colors">
              Smarty Corporate
            </button>
            <span>•</span>
            <button onClick={() => navigate("/corporate-wellness")} className="hover:text-primary transition-colors">
              Why Corporate Wellness?
            </button>
            <span>•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-primary transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => navigate("/termsofservice")} className="hover:text-primary transition-colors">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => navigate("/disclaimer")} className="hover:text-primary transition-colors">
              Disclaimer
            </button>
            <span>•</span>
            <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
              Contact
            </button>
          </div>
          
          {/* Copyright */}
          <p className="text-center text-sm text-muted-foreground">
            © 2025 <span className="text-primary font-semibold">SmartyGym</span> - Your Gym Re-imagined. Anywhere, Anytime.
          </p>
        </div>}
      </div>

      {/* Email Subscription Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Can I subscribe to receive email updates?</DialogTitle>
            <DialogDescription className="text-left pt-4">
              We've made a conscious decision not to offer email subscriptions or send promotional emails. 
              As fitness enthusiasts ourselves, we understand how overwhelming it can be to receive constant marketing emails 
              that often go unread. We don't want to contribute to inbox clutter or email fatigue. Instead, all important 
              updates, workout notifications, and communication happen directly within your <span className="text-primary font-semibold">SmartyGym</span> dashboard — 
              keeping everything organized in one place without distractions. If you'd like to stay connected and receive 
              updates about new content, you're welcome to follow us on social media. This approach ensures you only get 
              the information you need, when you need it, without unnecessary noise.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </footer>;
};