import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import DOMPurify from "dompurify";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Sun, Moon } from "lucide-react";
interface ReaderModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode | string;
  metadata?: {
    duration?: string;
    equipment?: string;
    difficulty?: string;
    author?: string;
    date?: string;
    readTime?: string;
    category?: string;
  };
}

export const ReaderModeDialog = ({
  open,
  onOpenChange,
  title,
  content,
  metadata,
}: ReaderModeDialogProps) => {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("readerModeFontSize");
    return saved ? parseInt(saved) : 18;
  });

  // Default reader theme follows the app's current theme.
  const { resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(resolvedTheme !== "light");

  // Sync to current app theme each time the dialog opens.
  useEffect(() => {
    if (open) setIsDarkMode(resolvedTheme !== "light");
  }, [open, resolvedTheme]);

  useEffect(() => {
    localStorage.setItem("readerModeFontSize", fontSize.toString());
  }, [fontSize]);

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 14));

  const sanitizedContent = typeof content === "string" ? DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a", "span", "div", "blockquote", "code", "pre", "img", "table", "thead", "tbody", "tr", "th", "td", "hr", "sub", "sup"],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style", "src", "alt", "width", "height", "colspan", "rowspan"],
    ALLOW_DATA_ATTR: false,
  }) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col ${
          isDarkMode
            ? "bg-zinc-900 text-zinc-100"
            : "bg-sky-50 text-zinc-900"
        }`}
      >
        {/* Control Bar */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isDarkMode
              ? "border-zinc-700 bg-zinc-800"
              : "border-sky-200 bg-sky-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Reader Mode
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Font Size Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-sky-200 text-zinc-700"
              }`}
              title="Decrease font size"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span
              className={`text-xs min-w-[40px] text-center ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              {fontSize}px
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-sky-200 text-zinc-700"
              }`}
              title="Increase font size"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <div
              className={`w-px h-6 mx-2 ${
                isDarkMode ? "bg-zinc-600" : "bg-sky-300"
              }`}
            />

            {/* Dark/Light Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-sky-200 text-zinc-700"
              }`}
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-sky-200 text-zinc-700"
              }`}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
          <article className="max-w-3xl mx-auto">
            {/* Title */}
            <h1
              className={`font-bold mb-6 leading-tight ${
                isDarkMode ? "text-zinc-100" : "text-zinc-900"
              }`}
              style={{ fontSize: `${fontSize + 8}px` }}
            >
              {title}
            </h1>

            {/* Metadata Bar */}
            {metadata && (
              <div
                className={`flex flex-wrap gap-3 mb-8 pb-6 border-b text-sm ${
                  isDarkMode
                    ? "border-zinc-700 text-zinc-400"
                    : "border-sky-200 text-zinc-600"
                }`}
              >
                {metadata.author && (
                  <span>
                    By{" "}
                    <strong
                      className={
                        isDarkMode ? "text-zinc-300" : "text-zinc-800"
                      }
                    >
                      {metadata.author}
                    </strong>
                  </span>
                )}
                {metadata.date && <span>• {metadata.date}</span>}
                {metadata.readTime && <span>• {metadata.readTime}</span>}
                {metadata.duration && <span>• {metadata.duration}</span>}
                {metadata.equipment && <span>• {metadata.equipment}</span>}
                {metadata.category && <span>• {metadata.category}</span>}
              </div>
            )}

            {/* Main Content */}
            <div
              className={`prose max-w-none ${
                isDarkMode ? "reader-mode-dark" : "reader-mode-light"
              }`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.7,
              }}
            >
              {typeof content === "string" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  style={{ color: "inherit" }}
                />
              ) : (
                <div style={{ color: "inherit" }}>{content}</div>
              )}
            </div>
          </article>
        </div>

        {/* Reader Mode Styles */}
        <style>{`
          .reader-mode-light.prose,
          .reader-mode-light.prose * {
            color: #18181b !important;
          }

          .reader-mode-dark.prose,
          .reader-mode-dark.prose * {
            color: #f4f4f5 !important;
          }

          .reader-mode-light.prose .exercise-view-eye,
          .reader-mode-dark.prose .exercise-view-eye {
            color: hsl(var(--primary)) !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};