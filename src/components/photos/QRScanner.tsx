import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (they happen frequently during scanning)
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      console.error('Scanner start error:', error);
      toast({
        title: 'Camera Access Failed',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error('Scanner stop error:', error);
      }
      setIsScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanning();

    // Parse QR code - expecting format: project:{projectId}
    if (decodedText.startsWith('project:')) {
      const projectId = decodedText.replace('project:', '');
      toast({
        title: 'Project Found',
        description: 'Opening project...',
      });
      navigate(`/projects/${projectId}`);
      onClose();
    } else {
      toast({
        title: 'Invalid QR Code',
        description: 'This QR code is not a valid project code',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Scan Project QR Code</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            stopScanning();
            onClose();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!isScanning ? (
          <div className="text-center">
            <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Position the QR code within the camera view
            </p>
            <Button onClick={startScanning}>
              Start Camera
            </Button>
          </div>
        ) : (
          <div id="qr-reader" className="w-full max-w-md"></div>
        )}
      </div>

      {isScanning && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            stopScanning();
            onClose();
          }}
        >
          Cancel
        </Button>
      )}
    </Card>
  );
}
