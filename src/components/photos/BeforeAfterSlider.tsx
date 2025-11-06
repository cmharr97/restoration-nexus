import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight } from 'lucide-react';

interface Photo {
  id: string;
  file_path: string;
  caption?: string;
  created_at: string;
}

interface BeforeAfterSliderProps {
  beforePhotos: Photo[];
  afterPhotos: Photo[];
  onClose: () => void;
}

export function BeforeAfterSlider({ beforePhotos, afterPhotos, onClose }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentBefore = beforePhotos[currentIndex];
  const currentAfter = afterPhotos[currentIndex];

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  if (!currentBefore || !currentAfter) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Not enough before/after photos to compare
          </p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">
              Before / After Comparison ({currentIndex + 1} of {Math.min(beforePhotos.length, afterPhotos.length)})
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          ref={containerRef}
          className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* After Image (right side) */}
          <img
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-photos/${currentAfter.file_path}`}
            alt="After"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Before Image (left side, clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-photos/${currentBefore.file_path}`}
              alt="Before"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-black" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-semibold">
            BEFORE
          </div>
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-semibold">
            AFTER
          </div>
        </div>

        {/* Navigation */}
        {Math.min(beforePhotos.length, afterPhotos.length) > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(Math.min(beforePhotos.length, afterPhotos.length) - 1, currentIndex + 1))}
              disabled={currentIndex >= Math.min(beforePhotos.length, afterPhotos.length) - 1}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
