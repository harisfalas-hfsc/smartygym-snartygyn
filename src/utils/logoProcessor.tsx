import { pipeline, env } from '@huggingface/transformers';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import uploadedLogo from '@/assets/smarty-gym-logo.png';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    if (import.meta.env.DEV) {
      console.log('Starting background removal process...');
    }
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    if (import.meta.env.DEV) {
      console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    if (import.meta.env.DEV) {
      console.log('Image converted to base64');
    }
    
    if (import.meta.env.DEV) {
      console.log('Processing with segmentation model...');
    }
    const result = await segmenter(imageData);
    
    if (import.meta.env.DEV) {
      console.log('Segmentation result:', result);
    }
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    if (import.meta.env.DEV) {
      console.log('Mask applied successfully');
    }
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            if (import.meta.env.DEV) {
              console.log('Successfully created final blob');
            }
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const LogoProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const processLogo = async () => {
    setProcessing(true);
    setStatus('Loading image...');
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = uploadedLogo;
      });

      setStatus('Removing background... This may take 30-60 seconds...');
      const processedBlob = await removeBackground(img);
      
      setStatus('Background removed! Downloading...');
      
      // Download for src/assets/
      const url1 = URL.createObjectURL(processedBlob);
      const link1 = document.createElement('a');
      link1.href = url1;
      link1.download = 'smarty-gym-logo-src-assets.png';
      link1.click();
      URL.revokeObjectURL(url1);
      
      // Download for public/
      setTimeout(() => {
        const url2 = URL.createObjectURL(processedBlob);
        const link2 = document.createElement('a');
        link2.href = url2;
        link2.download = 'smarty-gym-logo-public.png';
        link2.click();
        URL.revokeObjectURL(url2);
      }, 500);
      
      setStatus('✅ Done! Two files downloaded. Manually place them in: 1) src/assets/smarty-gym-logo.png 2) public/smarty-gym-logo.png');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Logo Background Remover</h1>
      <p className="mb-4">This utility will remove the background from the uploaded logo and download two copies.</p>
      <Button onClick={processLogo} disabled={processing}>
        {processing ? 'Processing...' : 'Process Logo'}
      </Button>
      {status && <p className="mt-4 text-sm">{status}</p>}
      <img src={uploadedLogo} alt="Original logo" className="mt-8 max-w-md border" />
    </div>
  );
};
