import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  getQueue,
  removeFromQueue,
  getQueueCount,
  onOnlineStatusChange,
  isOnline,
} from '@/lib/offlineQueue';

export function useOfflineQueue() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [queueCount, setQueueCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    updateQueueCount();
    
    const cleanup = onOnlineStatusChange((status) => {
      setOnline(status);
      if (status) {
        processQueue();
      }
    });

    return cleanup;
  }, []);

  const updateQueueCount = async () => {
    const count = await getQueueCount();
    setQueueCount(count);
  };

  const processQueue = async () => {
    if (isProcessing || !online || !user || !organization) return;

    setIsProcessing(true);
    const queue = await getQueue();

    if (queue.length === 0) {
      setIsProcessing(false);
      return;
    }

    toast({
      title: 'Syncing Photos',
      description: `Uploading ${queue.length} queued photo${queue.length > 1 ? 's' : ''}...`,
    });

    let successCount = 0;
    let failCount = 0;

    for (const photo of queue) {
      try {
        // Generate file path
        const fileExt = photo.fileName.split('.').pop();
        const fileName = `${photo.organizationId}/${photo.projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

        // Analyze with AI if room type is auto-detect
        let aiMetadata: any = {
          ai_category: null,
          ai_room_type: photo.roomType && photo.roomType !== 'Auto-detect' ? photo.roomType.toLowerCase() : null,
          ai_damage_type: null,
          ai_description: null,
          ai_tags: null,
          ai_confidence: null,
        };

        if (!photo.roomType || photo.roomType === 'Auto-detect') {
          try {
            const { data: analysisData } = await supabase.functions.invoke('analyze-photo', {
              body: { imageUrl: publicUrl, projectId: photo.projectId },
            });

            if (analysisData) {
              aiMetadata = { ...aiMetadata, ...analysisData };
            }
          } catch (aiError) {
            console.warn('AI analysis failed (non-blocking):', aiError);
          }
        }

        // Save to database
        const { error: dbError } = await (supabase
          .from('project_photos' as any)
          .insert({
            project_id: photo.projectId,
            organization_id: photo.organizationId,
            uploaded_by: photo.uploadedBy,
            file_path: fileName,
            file_name: photo.fileName,
            file_size: photo.fileSize,
            mime_type: photo.mimeType,
            caption: photo.caption || null,
            notes: photo.notes || null,
            is_before_photo: photo.isBeforePhoto,
            is_after_photo: photo.isAfterPhoto,
            location_lat: photo.locationLat || null,
            location_lng: photo.locationLng || null,
            ...aiMetadata,
          }) as any);

        if (dbError) throw dbError;

        // Remove from queue on success
        await removeFromQueue(photo.id);
        successCount++;
      } catch (error) {
        console.error('Failed to upload photo:', error);
        failCount++;
      }
    }

    await updateQueueCount();
    setIsProcessing(false);

    if (successCount > 0) {
      toast({
        title: 'Sync Complete',
        description: `${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });
    } else if (failCount > 0) {
      toast({
        title: 'Sync Failed',
        description: `Failed to upload ${failCount} photo${failCount > 1 ? 's' : ''}. Will retry when online.`,
        variant: 'destructive',
      });
    }
  };

  return {
    queueCount,
    isProcessing,
    online,
    processQueue,
    updateQueueCount,
  };
}
