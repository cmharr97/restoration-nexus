import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Line, IText, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Square, Circle as CircleIcon, Type, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoAnnotatorProps {
  imageUrl: string;
  onSave: (annotatedImageBlob: Blob) => void;
  onCancel: () => void;
}

export function PhotoAnnotator({ imageUrl, onSave, onCancel }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'rectangle' | 'circle' | 'text' | 'select'>('select');
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
    });

    // Load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const scale = Math.min(800 / img.width, 600 / img.height);
      canvas.setWidth(img.width * scale);
      canvas.setHeight(img.height * scale);
      
      // Use fabric.Image for background in v6
      const { FabricImage } = await import('fabric');
      const fabricImg = new FabricImage(img, {
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });
      canvas.backgroundImage = fabricImg;
      canvas.renderAll();
    };
    img.src = imageUrl;

    // Setup drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#ff0000';
    canvas.freeDrawingBrush.width = 3;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = '#ff0000';
      fabricCanvas.freeDrawingBrush.width = 3;
    }
  }, [activeTool, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: '#ff0000',
        strokeWidth: 3,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: '#ff0000',
        strokeWidth: 3,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === 'text') {
      const text = new IText('Add text', {
        left: 100,
        top: 100,
        fill: '#ff0000',
        fontSize: 24,
        fontWeight: 'bold',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (obj !== fabricCanvas.backgroundImage) {
        fabricCanvas.remove(obj);
      }
    });
    toast({
      title: 'Annotations Cleared',
      description: 'All annotations have been removed',
    });
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;

    try {
      const dataUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      onSave(blob);
      toast({
        title: 'Annotations Saved',
        description: 'Photo with annotations is ready to upload',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save annotations',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Annotate Photo</h3>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          size="sm"
          variant={activeTool === 'select' ? 'default' : 'outline'}
          onClick={() => setActiveTool('select')}
        >
          Select
        </Button>
        <Button
          size="sm"
          variant={activeTool === 'draw' ? 'default' : 'outline'}
          onClick={() => handleToolClick('draw')}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Draw
        </Button>
        <Button
          size="sm"
          variant={activeTool === 'rectangle' ? 'default' : 'outline'}
          onClick={() => handleToolClick('rectangle')}
        >
          <Square className="h-4 w-4 mr-2" />
          Rectangle
        </Button>
        <Button
          size="sm"
          variant={activeTool === 'circle' ? 'default' : 'outline'}
          onClick={() => handleToolClick('circle')}
        >
          <CircleIcon className="h-4 w-4 mr-2" />
          Circle
        </Button>
        <Button
          size="sm"
          variant={activeTool === 'text' ? 'default' : 'outline'}
          onClick={() => handleToolClick('text')}
        >
          <Type className="h-4 w-4 mr-2" />
          Text
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Download className="h-4 w-4 mr-2" />
          Save Annotations
        </Button>
      </div>
    </Card>
  );
}
