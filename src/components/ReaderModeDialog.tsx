import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer, Plus, Minus, Sun, Moon } from "lucide-react";

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

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("readerModeDarkMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("readerModeFontSize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("readerModeDarkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 14));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col ${
          isDarkMode
            ? "bg-zinc-900 text-zinc-100"
            : "bg-amber-50 text-zinc-900"
        }`}
      >
        {/* Control Bar */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isDarkMode
              ? "border-zinc-700 bg-zinc-800"
              : "border-amber-200 bg-amber-100"
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
                  : "hover:bg-amber-200 text-zinc-700"
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
                  : "hover:bg-amber-200 text-zinc-700"
              }`}
              title="Increase font size"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <div
              className={`w-px h-6 mx-2 ${
                isDarkMode ? "bg-zinc-600" : "bg-amber-300"
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
                  : "hover:bg-amber-200 text-zinc-700"
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

            {/* Print Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-amber-200 text-zinc-700"
              }`}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <div
              className={`w-px h-6 mx-2 ${
                isDarkMode ? "bg-zinc-600" : "bg-amber-300"
              }`}
            />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className={`h-8 w-8 ${
                isDarkMode
                  ? "hover:bg-zinc-700 text-zinc-300"
                  : "hover:bg-amber-200 text-zinc-700"
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
                    : "border-amber-200 text-zinc-600"
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
                  dangerouslySetInnerHTML={{ __html: content }}
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

          @media print {
            body * {
              visibility: hidden;
            }
            [role="dialog"], [role="dialog"] * {
              visibility: visible;
            }
            [role="dialog"] {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              background: white !important;
              color: black !important;
            }
            [role="dialog"] > div:first-child {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
