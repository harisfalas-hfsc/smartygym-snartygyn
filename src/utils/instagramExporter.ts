import { saveAs } from "file-saver";

export interface InstagramSize {
  name: string;
  width: number;
  height: number;
  label: string;
}

export const INSTAGRAM_SIZES: InstagramSize[] = [
  { name: "square", width: 1080, height: 1080, label: "Square (1:1)" },
  { name: "portrait", width: 1080, height: 1350, label: "Portrait (4:5)" },
  { name: "landscape", width: 1080, height: 608, label: "Landscape (16:9)" },
];

export const exportToInstagram = async (
  elementId: string,
  filename: string,
  size: InstagramSize
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element not found: ${elementId}`);
  }

  // Use html2canvas to render the element at its native size
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    backgroundColor: "hsl(224, 71%, 4%)",
    scale: 1,
    logging: false,
    useCORS: true,
    width: size.width,
    height: size.height,
  });

  // Convert to JPEG and download using file-saver for better cross-browser/mobile support
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          saveAs(blob, `${filename}-${Date.now()}.jpg`);
          resolve();
        } else {
          reject(new Error("Failed to create image blob"));
        }
      },
      "image/jpeg",
      0.95
    );
  });
};
