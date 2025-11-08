import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, QrCode, WifiOff } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProjectOverview from '@/components/project-detail/ProjectOverview';
import ProjectTeamMembers from '@/components/project-detail/ProjectTeamMembers';
import ProjectDocuments from '@/components/project-detail/ProjectDocuments';
import ProjectTimeline from '@/components/project-detail/ProjectTimeline';
import ProjectActivityLog from '@/components/project-detail/ProjectActivityLog';
import TimeTracker from '@/components/project-detail/TimeTracker';
import ProjectBudgetTracker from '@/components/project-detail/ProjectBudgetTracker';
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
      <div className="min-h-screen bg-background">
        <div className="fixed top-16 left-64 right-0 bg-background border-b border-border z-40 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-headline font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              {project.project_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
            {queueCount > 0 && (
              <Badge variant="secondary">
                {queueCount} queued
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRScanner(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-40 pb-8 px-6 ml-64">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProjectOverview project={project} onUpdate={updateProject} />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <ProjectTeamMembers projectId={project.id} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <ProjectDocuments projectId={project.id} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <ProjectTimeline project={project} onUpdate={updateProject} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ProjectActivityLog projectId={project.id} />
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <TimeTracker projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <ProjectBudgetTracker 
              estimatedCost={project.estimated_cost} 
              actualCost={project.actual_cost}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Quick Camera Button */}
      <QuickCameraButton projectId={project.id} onPhotoTaken={() => window.location.reload()} />
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner onClose={() => setShowQRScanner(false)} />
      )}

      {/* Nearby Project Detector */}
      <NearbyProjectDetector projects={projects} />
      </div>
    </>
  );
}
