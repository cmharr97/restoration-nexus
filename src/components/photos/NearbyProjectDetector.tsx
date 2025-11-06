import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  address: string;
  distance?: number;
}

interface NearbyProjectDetectorProps {
  projects: Project[];
}

export function NearbyProjectDetector({ projects }: NearbyProjectDetectorProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyProjects, setNearbyProjects] = useState<Project[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Geocode address using Mapbox via backend
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address },
      });

      if (error) {
        console.error('Geocoding error:', error);
        return null;
      }

      return data.coordinates || null;
    } catch (error) {
      console.error('Failed to geocode:', error);
      return null;
    }
  };

  const detectNearbyProjects = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location Not Supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Calculate distances for all projects with addresses
        const projectsWithDistance = await Promise.all(
          projects
            .filter(p => p.address && p.address.trim().length > 0)
            .map(async (project) => {
              const projectCoords = await geocodeAddress(project.address);
              
              if (!projectCoords) {
                console.warn(`Failed to geocode project: ${project.name} (${project.address})`);
                return null;
              }

              const distance = calculateDistance(
                latitude,
                longitude,
                projectCoords.lat,
                projectCoords.lng
              );

              return { ...project, distance };
            })
        );

        // Filter out null results and projects more than 5km away
        const nearby = projectsWithDistance
          .filter((p): p is Project & { distance: number } => p !== null && p.distance < 5)
          .sort((a, b) => a.distance - b.distance);

        setNearbyProjects(nearby);
        
        if (nearby.length > 0) {
          setShowSuggestions(true);
          toast({
            title: 'Nearby Projects Found',
            description: `Found ${nearby.length} project${nearby.length > 1 ? 's' : ''} near your location`,
          });
        } else {
          toast({
            title: 'No Nearby Projects',
            description: 'No projects found within 5km of your location',
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: 'Location Access Denied',
          description: 'Please enable location services to use this feature',
          variant: 'destructive',
        });
      }
    );
  };

  useEffect(() => {
    // Auto-detect on mount if projects exist
    if (projects.length > 0) {
      detectNearbyProjects();
    }
  }, [projects.length]);

  if (!showSuggestions || nearbyProjects.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={detectNearbyProjects}
        className="flex items-center gap-2"
      >
        <Navigation className="h-4 w-4" />
        Find Nearby Projects
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-6 z-40 p-4 max-w-sm shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Nearby Projects</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowSuggestions(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {nearbyProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-start justify-between gap-2 p-2 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => {
              navigate(`/projects/${project.id}`);
              setShowSuggestions(false);
            }}
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.address}</p>
              <p className="text-xs text-primary font-semibold mt-1">
                {project.distance?.toFixed(1)} km away
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
