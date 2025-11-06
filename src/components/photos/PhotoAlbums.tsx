import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Home, AlertTriangle } from 'lucide-react';

interface Photo {
  id: string;
  file_path: string;
  caption?: string;
  created_at: string;
  ai_room_type?: string;
  ai_damage_type?: string;
  ai_category?: string;
}

interface PhotoAlbumsProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export function PhotoAlbums({ photos, onPhotoClick }: PhotoAlbumsProps) {
  const [activeTab, setActiveTab] = useState('date');

  // Organize by date
  const photosByDate = useMemo(() => {
    const grouped = photos.reduce((acc, photo) => {
      const date = new Date(photo.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
    return Object.entries(grouped).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [photos]);

  // Organize by room
  const photosByRoom = useMemo(() => {
    const grouped = photos.reduce((acc, photo) => {
      const room = photo.ai_room_type || 'Uncategorized';
      if (!acc[room]) acc[room] = [];
      acc[room].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [photos]);

  // Organize by damage type
  const photosByDamage = useMemo(() => {
    const grouped = photos.reduce((acc, photo) => {
      const damage = photo.ai_damage_type || photo.ai_category || 'General';
      if (!acc[damage]) acc[damage] = [];
      acc[damage].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [photos]);

  const renderPhotoGrid = (albumPhotos: Photo[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {albumPhotos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
          onClick={() => onPhotoClick(photo)}
        >
          <img
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-photos/${photo.file_path}`}
            alt={photo.caption || 'Project photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
              {photo.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Smart Photo Albums</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            By Date
          </TabsTrigger>
          <TabsTrigger value="room" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            By Room
          </TabsTrigger>
          <TabsTrigger value="damage" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            By Damage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="date" className="space-y-6">
          {photosByDate.map(([date, datePhotos]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold">{date}</h4>
                <Badge variant="secondary">{datePhotos.length} photos</Badge>
              </div>
              {renderPhotoGrid(datePhotos)}
            </div>
          ))}
          {photosByDate.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No photos yet</p>
          )}
        </TabsContent>

        <TabsContent value="room" className="space-y-6">
          {photosByRoom.map(([room, roomPhotos]) => (
            <div key={room}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold capitalize">{room}</h4>
                <Badge variant="secondary">{roomPhotos.length} photos</Badge>
              </div>
              {renderPhotoGrid(roomPhotos)}
            </div>
          ))}
          {photosByRoom.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No photos yet</p>
          )}
        </TabsContent>

        <TabsContent value="damage" className="space-y-6">
          {photosByDamage.map(([damage, damagePhotos]) => (
            <div key={damage}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold capitalize">{damage}</h4>
                <Badge variant="secondary">{damagePhotos.length} photos</Badge>
              </div>
              {renderPhotoGrid(damagePhotos)}
            </div>
          ))}
          {photosByDamage.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No photos yet</p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
