import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get a signed URL for a private storage file
 * @param bucket - Storage bucket name
 * @param filePath - Path to the file in the bucket
 * @param expiresIn - URL expiry time in seconds (default: 3600 = 1 hour)
 */
export function useSignedUrl(bucket: string, filePath: string | null | undefined, expiresIn: number = 3600) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!filePath) {
      setUrl('');
      setLoading(false);
      return;
    }

    const getSignedUrl = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) throw error;
        if (data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Failed to get signed URL:', err);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [bucket, filePath, expiresIn]);

  return { url, loading, error };
}

/**
 * Utility function to get a signed URL (for use outside of React components)
 */
export async function getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (err) {
    console.error('Failed to get signed URL:', err);
    return null;
  }
}
