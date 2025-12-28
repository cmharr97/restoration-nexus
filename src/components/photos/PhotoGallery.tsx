import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Download, Trash2, MapPin, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getSignedUrl } from '@/hooks/useSignedUrl';

interface PhotoGalleryProps {
  projectId: string;
}

// Component for a single photo thumbnail with signed URL
function PhotoCard({ 
  photo, 
  onClick, 
  getCategoryColor 
}: { 
  photo: any; 
  onClick: () => void; 
  getCategoryColor: (category: string) => string;
}) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      const signedUrl = await getSignedUrl('project-photos', photo.file_path);
      setUrl(signedUrl || '');
      setLoading(false);
    };
    fetchUrl();
  }, [photo.file_path]);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img
            src={url}
            alt={photo.caption || 'Project photo'}
            className="w-full h-full object-cover"
          />
        )}
        {photo.ai_category && (
          <Badge className={`absolute top-2 left-2 ${getCategoryColor(photo.ai_category)}`}>
            {photo.ai_category}
          </Badge>
        )}
        {(photo.is_before_photo || photo.is_after_photo) && (
          <Badge className="absolute top-2 right-2 bg-accent">
            {photo.is_before_photo ? 'Before' : 'After'}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-medium truncate">
          {photo.caption || photo.file_name}
        </p>
        {photo.ai_room_type && (
          <p className="text-xs text-muted-foreground capitalize">
            {photo.ai_room_type}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PhotoGallery({ projectId }: PhotoGalleryProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [loadingPhotoUrl, setLoadingPhotoUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');

  useEffect(() => {
    fetchPhotos();
  }, [projectId]);

  useEffect(() => {
    filterPhotos();
  }, [photos, searchQuery, categoryFilter, roomFilter]);

  // Fetch signed URL when a photo is selected
  useEffect(() => {
    if (selectedPhoto) {
      const fetchUrl = async () => {
        setLoadingPhotoUrl(true);
        const url = await getSignedUrl('project-photos', selectedPhoto.file_path);
        setSelectedPhotoUrl(url || '');
        setLoadingPhotoUrl(false);
      };
      fetchUrl();
    } else {
      setSelectedPhotoUrl('');
    }
  }, [selectedPhoto]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await (supabase
        .from('project_photos' as any)
        .select(`
          *,
          uploader:uploaded_by (
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setPhotos((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load photos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = [...photos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(photo => 
        photo.file_name?.toLowerCase().includes(query) ||
        photo.caption?.toLowerCase().includes(query) ||
        photo.notes?.toLowerCase().includes(query) ||
        photo.ai_description?.toLowerCase().includes(query) ||
        photo.ai_tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(photo => photo.ai_category === categoryFilter);
    }

    if (roomFilter !== 'all') {
      filtered = filtered.filter(photo => photo.ai_room_type === roomFilter);
    }

    setFilteredPhotos(filtered);
  };

  const handleDelete = async (photoId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('project-photos')
        .remove([filePath]);

      // Delete from database
      const { error } = await (supabase
        .from('project_photos' as any)
        .delete()
        .eq('id', photoId) as any);

      if (error) throw error;

      toast({
        title: 'Photo Deleted',
        description: 'Photo has been deleted successfully',
      });

      setSelectedPhoto(null);
      fetchPhotos();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (photo: any) => {
    try {
      const url = await getSignedUrl('project-photos', photo.file_path);
      if (!url) {
        throw new Error('Failed to get download URL');
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = useCallback((category: string) => {
    const colors: Record<string, string> = {
      damage: 'bg-red-500/10 text-red-500',
      before: 'bg-blue-500/10 text-blue-500',
      after: 'bg-green-500/10 text-green-500',
      progress: 'bg-yellow-500/10 text-yellow-500',
      equipment: 'bg-purple-500/10 text-purple-500',
      documentation: 'bg-gray-500/10 text-gray-500',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500';
  }, []);

  const uniqueCategories = Array.from(new Set(photos.map(p => p.ai_category).filter(Boolean)));
  const uniqueRooms = Array.from(new Set(photos.map(p => p.ai_room_type).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat: any) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {uniqueRooms.map((room: any) => (
                  <SelectItem key={room} value={room} className="capitalize">
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{photos.length}</p>
            <p className="text-sm text-muted-foreground">Total Photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {photos.filter(p => p.is_before_photo).length}
            </p>
            <p className="text-sm text-muted-foreground">Before</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {photos.filter(p => p.is_after_photo).length}
            </p>
            <p className="text-sm text-muted-foreground">After</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{uniqueRooms.length}</p>
            <p className="text-sm text-muted-foreground">Rooms</p>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || roomFilter !== 'all'
                ? 'No photos match your filters'
                : 'No photos uploaded yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.caption || selectedPhoto.file_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {loadingPhotoUrl ? (
                  <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={selectedPhotoUrl}
                    alt={selectedPhoto.caption || 'Project photo'}
                    className="w-full rounded-lg"
                  />
                )}

                {/* AI Analysis */}
                {selectedPhoto.ai_description && (
                  <Card className="bg-accent/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedPhoto.ai_description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhoto.ai_category && (
                          <Badge className={getCategoryColor(selectedPhoto.ai_category)}>
                            {selectedPhoto.ai_category}
                          </Badge>
                        )}
                        {selectedPhoto.ai_room_type && (
                          <Badge variant="outline" className="capitalize">
                            {selectedPhoto.ai_room_type}
                          </Badge>
                        )}
                        {selectedPhoto.ai_damage_type && (
                          <Badge variant="outline" className="capitalize">
                            {selectedPhoto.ai_damage_type}
                          </Badge>
                        )}
                      </div>
                      {selectedPhoto.ai_tags && selectedPhoto.ai_tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {selectedPhoto.ai_tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedPhoto.uploader && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPhoto.uploader.full_name || selectedPhoto.uploader.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedPhoto.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  {selectedPhoto.location_lat && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedPhoto.location_lat.toFixed(6)}, {selectedPhoto.location_lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedPhoto.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedPhoto.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(selectedPhoto)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedPhoto.id, selectedPhoto.file_path)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
