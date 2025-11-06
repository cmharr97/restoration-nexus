import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProjectOverview from '@/components/project-detail/ProjectOverview';
import ProjectTeamMembers from '@/components/project-detail/ProjectTeamMembers';
import ProjectDocuments from '@/components/project-detail/ProjectDocuments';
import ProjectTimeline from '@/components/project-detail/ProjectTimeline';
import ProjectActivityLog from '@/components/project-detail/ProjectActivityLog';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, loading, updateProject } = useProjects();
  const [project, setProject] = useState(projects.find(p => p.id === id));

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
        </div>
      </div>

      <div className="pt-40 pb-8 px-6 ml-64">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
        </Tabs>
      </div>
      </div>
    </>
  );
}
