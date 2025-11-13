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
    throw new Error("Element not found");
  }

  // Create a canvas at Instagram dimensions
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Fill with background color
  ctx.fillStyle = "hsl(224, 71%, 4%)"; // background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Use html2canvas to render the element
  const html2canvas = (await import("html2canvas")).default;
  const sourceCanvas = await html2canvas(element, {
    backgroundColor: "hsl(224, 71%, 4%)",
    scale: 2,
    logging: false,
    useCORS: true,
  });

  // Calculate scaling to fit Instagram dimensions while maintaining aspect ratio
  const scale = Math.min(
    size.width / sourceCanvas.width,
    size.height / sourceCanvas.height
  );

  const scaledWidth = sourceCanvas.width * scale;
  const scaledHeight = sourceCanvas.height * scale;
  const x = (size.width - scaledWidth) / 2;
  const y = (size.height - scaledHeight) / 2;

  // Draw the scaled image centered
  ctx.drawImage(sourceCanvas, x, y, scaledWidth, scaledHeight);

  // Convert to JPEG and download
  canvas.toBlob(
    (blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}-${size.name}-${Date.now()}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    },
    "image/jpeg",
    0.9
  );
};
