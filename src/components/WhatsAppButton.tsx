import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";

export const WhatsAppButton = () => {
  const { userTier, isLoading } = useAccessControl();
  const phoneNumber = "+35796000620";
  const message = "Hi! I'm interested in SmartyGym services.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Only show for premium users
  if (isLoading || userTier !== "premium") {
    return null;
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-[80] h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 bg-[#25D366] hover:bg-[#20BA5A] p-0 flex items-center justify-center"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
    </Button>
  );
};
