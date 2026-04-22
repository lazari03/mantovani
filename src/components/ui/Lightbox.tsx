import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}) => {
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10 p-2"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Navigation - only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 lg:left-8 text-white/70 hover:text-white transition-colors z-10 p-2"
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 lg:right-8 text-white/70 hover:text-white transition-colors z-10 p-2"
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* Image */}
      <img
        src={currentImage.src}
        alt={currentImage.alt}
        className="max-w-[90vw] max-h-[85vh] object-contain animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Counter - only show if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image title/caption if available */}
      {currentImage.alt && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm max-w-[80vw] text-center">
          {currentImage.alt}
        </div>
      )}
    </div>
  );
};

export default Lightbox;
