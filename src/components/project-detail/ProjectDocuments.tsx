import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { PhotoUploader } from '@/components/photos/PhotoUploader';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { BatchPhotoUploader } from '@/components/photos/BatchPhotoUploader';

interface ProjectDocumentsProps {
  projectId: string;
}

type Document = {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string;
  uploaded_at: string;
  uploaded_by: string;
  notes: string | null;
};

export default function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_documents' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const deleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('project_documents' as any)
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Document Deleted',
        description: 'Document has been removed',
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;
    if (fileType.startsWith('image/')) return Image;
    return FileText;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'photos': return 'bg-blue-500 text-white';
      case 'reports': return 'bg-purple-500 text-white';
      case 'contracts': return 'bg-orange-500 text-white';
      case 'estimates': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Tabs defaultValue="photos" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="photos" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <PhotoUploader projectId={projectId} onUploadComplete={fetchDocuments} />
          <BatchPhotoUploader projectId={projectId} onUploadComplete={fetchDocuments} />
        </div>
        <PhotoGallery projectId={projectId} />
      </TabsContent>

      <TabsContent value="documents">
        <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Project files and attachments</CardDescription>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-24 bg-muted rounded mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.file_type);
              return (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <Badge className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                    </div>
                  </div>

                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{doc.name}</h4>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>{formatFileSize(doc.file_size)}</p>
                    <p>
                      Uploaded {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                    </p>
                  </div>

                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
      </TabsContent>
    </Tabs>
  );
}
