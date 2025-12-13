import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ProjectHQ } from '@/components/project/ProjectHQ';
import { QuickCameraButton } from '@/components/photos/QuickCameraButton';
import { QRScanner } from '@/components/photos/QRScanner';
import { NearbyProjectDetector } from '@/components/photos/NearbyProjectDetector';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, loading, updateProject } = useProjects();
  const [project, setProject] = useState(projects.find(p => p.id === id));
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { queueCount, online } = useOfflineQueue();

  useEffect(() => {
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [projects, id]);

  if (loading && !project) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen ml-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 ml-64">
          <p className="text-muted-foreground">Project not found</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background lg:ml-64 mt-16">
        <ProjectHQ project={project} onUpdate={updateProject} />
      </div>
      
      {/* Floating Quick Camera Button */}
      <QuickCameraButton projectId={project.id} onPhotoTaken={() => window.location.reload()} />
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner onClose={() => setShowQRScanner(false)} />
      )}

      {/* Nearby Project Detector */}
      <NearbyProjectDetector projects={projects} />
    </>
  );
}
