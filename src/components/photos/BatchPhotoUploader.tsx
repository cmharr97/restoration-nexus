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
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BatchPhotoUploaderProps {
  projectId: string;
  onUploadComplete?: () => void;
}

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
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

export function BatchPhotoUploader({ projectId, onUploadComplete }: BatchPhotoUploaderProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sharedNotes, setSharedNotes] = useState('');
  const [manualRoomType, setManualRoomType] = useState('Auto-detect');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (files: FileList) => {
    const newPhotos: PhotoFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push({
          file,
          preview: reader.result as string,
          id: `${Date.now()}-${Math.random()}`,
        });
        
        if (newPhotos.length === files.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadBatch = async () => {
    if (photos.length === 0 || !user || !organization) return;

    setUploading(true);
    const totalPhotos = photos.length;
    let completed = 0;

    try {
      for (const photo of photos) {
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${organization.id}/${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('project-photos')
          .upload(fileName, photo.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(fileName);

        // Analyze with AI if auto-detect
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
            const { data: analysisData } = await supabase.functions.invoke('analyze-photo', {
              body: { imageUrl: publicUrl, projectId },
            });
            if (analysisData) {
              aiMetadata = { ...aiMetadata, ...analysisData };
            }
          } catch (aiError) {
            console.warn('AI analysis skipped:', aiError);
          }
        }

        // Save to database
        await (supabase
          .from('project_photos' as any)
          .insert({
            project_id: projectId,
            organization_id: organization.id,
            uploaded_by: user.id,
            file_path: fileName,
            file_name: photo.file.name,
            file_size: photo.file.size,
            mime_type: photo.file.type,
            notes: sharedNotes || null,
            ...aiMetadata,
          }) as any);

        completed++;
        setProgress(Math.round((completed / totalPhotos) * 100));
      }

      toast({
        title: 'Batch Upload Complete',
        description: `Successfully uploaded ${totalPhotos} photo${totalPhotos > 1 ? 's' : ''}`,
      });

      setPhotos([]);
      setSharedNotes('');
      setManualRoomType('Auto-detect');
      setProgress(0);
      onUploadComplete?.();

    } catch (error: any) {
      console.error('Batch upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Batch Photo Upload</h3>

      {photos.length === 0 ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-32 flex flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-8 w-8" />
            <span>Select Multiple Photos</span>
            <span className="text-xs text-muted-foreground">
              Upload multiple photos at once
            </span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removePhoto(photo.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed rounded flex items-center justify-center hover:border-accent transition-colors"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
          />

          {/* Batch Metadata */}
          <div className="space-y-3">
            <div>
              <Label>Room Type (applies to all)</Label>
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
                  AI will analyze each photo individually
                </p>
              )}
            </div>

            <div>
              <Label>Shared Notes (Optional)</Label>
              <Textarea
                value={sharedNotes}
                onChange={(e) => setSharedNotes(e.target.value)}
                placeholder="Add notes that apply to all photos..."
                rows={3}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading {photos.length} photos... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPhotos([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              className="flex-1"
              onClick={uploadBatch}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading {progress}%
                </>
              ) : (
                `Upload ${photos.length} Photo${photos.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
