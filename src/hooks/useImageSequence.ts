import { useEffect, useRef, useState, useCallback } from 'react';

interface UseImageSequenceOptions {
  frameCount: number;
  basePath: string;
  padLength?: number;
  extension?: string;
  preloadBatch?: number;
}

interface ImageSequenceState {
  images: HTMLImageElement[];
  loadedCount: number;
  isLoaded: boolean;
  progress: number;
}

export function useImageSequence({
  frameCount,
  basePath,
  padLength = 4,
  extension = 'webp',
  preloadBatch = 30,
}: UseImageSequenceOptions) {
  const [state, setState] = useState<ImageSequenceState>({
    images: [],
    loadedCount: 0,
    isLoaded: false,
    progress: 0,
  });

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const abortRef = useRef(false);

  const padNumber = useCallback(
    (num: number) => num.toString().padStart(padLength, '0'),
    [padLength]
  );

  const loadImage = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `${basePath}_${padNumber(index + 1)}.${extension}`;
      });
    },
    [basePath, extension, padNumber]
  );

  useEffect(() => {
    abortRef.current = false;
    const images: HTMLImageElement[] = new Array(frameCount);
    imagesRef.current = images;

    // Preload first batch immediately (critical frames)
    const loadInitialBatch = async () => {
      const initialCount = Math.min(preloadBatch, frameCount);
      const initialPromises: Promise<void>[] = [];

      for (let i = 0; i < initialCount; i++) {
        initialPromises.push(
          loadImage(i).then((img) => {
            if (abortRef.current) return;
            images[i] = img;
            setState((prev) => ({
              ...prev,
              images,
              loadedCount: prev.loadedCount + 1,
              progress: (prev.loadedCount + 1) / frameCount,
            }));
          })
        );
      }

      await Promise.all(initialPromises);

      if (abortRef.current) return;

      // Mark as loaded enough to start
      setState((prev) => ({
        ...prev,
        isLoaded: true,
        images,
      }));

      // Lazy load remaining frames
      const loadRemaining = async () => {
        for (let i = initialCount; i < frameCount; i++) {
          if (abortRef.current) break;

          // Use requestIdleCallback if available, otherwise setTimeout
          const schedule =
            typeof window !== 'undefined' && 'requestIdleCallback' in window
              ? window.requestIdleCallback
              : (cb: () => void) => setTimeout(cb, 1);

          await new Promise<void>((resolve) => {
            schedule(() => {
              loadImage(i).then((img) => {
                if (!abortRef.current) {
                  images[i] = img;
                  setState((prev) => ({
                    ...prev,
                    images,
                    loadedCount: prev.loadedCount + 1,
                    progress: (prev.loadedCount + 1) / frameCount,
                  }));
                }
                resolve();
              });
            });
          });
        }
      };

      loadRemaining();
    };

    loadInitialBatch();

    return () => {
      abortRef.current = true;
    };
  }, [frameCount, loadImage, preloadBatch]);

  return {
    images: state.images,
    loadedCount: state.loadedCount,
    isLoaded: state.isLoaded,
    progress: state.progress,
  };
}
