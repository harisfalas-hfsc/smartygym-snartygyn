import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative h-11 w-11 rounded-full"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Avatar className="h-11 w-11 ring-2 ring-blue-500 ring-offset-2 ring-offset-background">
        <AvatarFallback className="relative bg-transparent text-foreground">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </AvatarFallback>
      </Avatar>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
