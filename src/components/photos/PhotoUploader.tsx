import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, X, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PhotoUploaderProps {
  projectId: string;
  initialFile?: File | null;
  onUploadComplete?: () => void;
}

const ROOM_TYPES = [
  'Auto-detect',
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Living Room',
  'Dining Room',
  'Basement',
  'Attic',
  'Garage',
  'Exterior',
  'Roof',
  'Office',
];

export function PhotoUploader({ projectId, initialFile, onUploadComplete }: PhotoUploaderProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [isBeforePhoto, setIsBeforePhoto] = useState(false);
  const [isAfterPhoto, setIsAfterPhoto] = useState(false);
  const [manualRoomType, setManualRoomType] = useState('Auto-detect');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load initial file if provided
  useState(() => {
    if (initialFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(initialFile);
    }
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Try to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('Location not available:', error)
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !organization) return;

    setUploading(true);
    setProgress(10);

    try {
      // Generate file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${organization.id}/${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      setProgress(20);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(40);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-photos')
        .getPublicUrl(fileName);

      setProgress(60);
      setAnalyzing(true);

      // Analyze with AI (skip if manual room is selected)
      let aiMetadata = {
        ai_category: null,
        ai_room_type: manualRoomType !== 'Auto-detect' ? manualRoomType.toLowerCase() : null,
        ai_damage_type: null,
        ai_description: null,
        ai_tags: null,
        ai_confidence: null,
      };

      if (manualRoomType === 'Auto-detect') {
        try {
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-photo', {
            body: {
              imageUrl: publicUrl,
              projectId: projectId,
            },
          });

          if (!analysisError && analysisData) {
            aiMetadata = { ...aiMetadata, ...analysisData };
            console.log('AI Analysis:', aiMetadata);
          } else {
            console.warn('AI analysis failed:', analysisError);
          }
        } catch (aiError) {
          console.warn('AI analysis error (non-blocking):', aiError);
        }
      }

      setAnalyzing(false);
      setProgress(80);

      // Save to database
      const { error: dbError } = await (supabase
        .from('project_photos' as any)
        .insert({
          project_id: projectId,
          organization_id: organization.id,
          uploaded_by: user.id,
          file_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          caption: caption || null,
          notes: notes || null,
          is_before_photo: isBeforePhoto,
          is_after_photo: isAfterPhoto,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          ...aiMetadata,
        }) as any);

      if (dbError) throw dbError;

      setProgress(100);

      toast({
        title: 'Photo Uploaded',
        description: aiMetadata.ai_description 
          ? `AI detected: ${aiMetadata.ai_category} - ${aiMetadata.ai_description.substring(0, 60)}...`
          : 'Photo uploaded successfully',
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      setNotes('');
      setIsBeforePhoto(false);
      setIsAfterPhoto(false);
      setLocation(null);
      setProgress(0);

      onUploadComplete?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Photos</h3>

      {!preview ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span>Choose File</span>
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            {location && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location captured
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="room">Room Type</Label>
              <Select value={manualRoomType} onValueChange={setManualRoomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {manualRoomType === 'Auto-detect' && (
                <p className="text-xs text-muted-foreground mt-1">
                  AI will automatically detect the room type
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., Water damage in kitchen"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details about this photo..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isBeforePhoto}
                  onCheckedChange={setIsBeforePhoto}
                  id="before"
                />
                <Label htmlFor="before">Before Photo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isAfterPhoto}
                  onCheckedChange={setIsAfterPhoto}
                  id="after"
                />
                <Label htmlFor="after">After Photo</Label>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {analyzing ? 'Analyzing with AI...' : `Uploading... ${progress}%`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Photo'
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
