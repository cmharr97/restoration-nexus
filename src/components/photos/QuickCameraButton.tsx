import { useState } from 'react';
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PhotoUploader } from './PhotoUploader';
import { useToast } from '@/hooks/use-toast';

// Declare Capacitor on window
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

interface QuickCameraButtonProps {
  projectId: string;
  onPhotoTaken?: () => void;
}

export function QuickCameraButton({ projectId, onPhotoTaken }: QuickCameraButtonProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const takePicture = async () => {
    try {
      // Check if we're on a native device
      const isNative = window.Capacitor?.isNativePlatform();

      if (isNative) {
        // Use native camera
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        // Convert to file
        const response = await fetch(image.webPath!);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        setCapturedPhoto(file);
        setShowUploader(true);
      } else {
        // Fallback to web camera
        setShowUploader(true);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: error.message || 'Failed to access camera',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={takePicture}
      >
        <CameraIcon className="h-6 w-6" />
      </Button>

      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <PhotoUploader
            projectId={projectId}
            initialFile={capturedPhoto}
            onUploadComplete={() => {
              setShowUploader(false);
              setCapturedPhoto(null);
              onPhotoTaken?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
