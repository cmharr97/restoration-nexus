import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  Calendar,
  Flame,
  Users,
  Settings,
  Droplets,
  Bug,
  CloudLightning,
  Hammer,
  HelpCircle,
  Clock,
  DollarSign,
  Activity,
  GitBranch,
  Camera,
  Thermometer,
  Wrench,
  ClipboardList,
  MessageCircle,
  StickyNote,
  Shield
} from 'lucide-react';

// Components
import ProjectOverview from '@/components/project-detail/ProjectOverview';
import ProjectTeamMembers from '@/components/project-detail/ProjectTeamMembers';
import ProjectDocuments from '@/components/project-detail/ProjectDocuments';
import ProjectTimeline from '@/components/project-detail/ProjectTimeline';
import ProjectActivityLog from '@/components/project-detail/ProjectActivityLog';
import TimeTracker from '@/components/project-detail/TimeTracker';
import ProjectBudgetTracker from '@/components/project-detail/ProjectBudgetTracker';
import ExpenseSubmission from '@/components/project-detail/ExpenseSubmission';
import ExpenseList from '@/components/project-detail/ExpenseList';
import { WorkflowHandoffs } from '@/components/project-detail/WorkflowHandoffs';
import { ProjectMessageBoard } from '@/components/project/ProjectMessageBoard';
import { ProjectTodos } from '@/components/project/ProjectTodos';
import { ProjectCampfire } from '@/components/project/ProjectCampfire';
import { PhotoGallery } from '@/components/photos/PhotoGallery';

const LOSS_TYPE_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="h-8 w-8" />,
  fire: <Flame className="h-8 w-8" />,
  mold: <Bug className="h-8 w-8" />,
  storm: <CloudLightning className="h-8 w-8" />,
  reconstruction: <Hammer className="h-8 w-8" />,
  other: <HelpCircle className="h-8 w-8" />,
};

const LOSS_TYPE_COLORS: Record<string, string> = {
  water: 'from-blue-600 to-blue-800',
  fire: 'from-orange-600 to-red-700',
  mold: 'from-emerald-600 to-green-800',
  storm: 'from-purple-600 to-violet-800',
  reconstruction: 'from-slate-600 to-gray-800',
  other: 'from-gray-600 to-gray-800',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  emergency: 'Emergency Response',
  inspection: 'Inspection',
  recon: 'Recon / Estimating',
  mitigation: 'Mitigation',
  contents: 'Contents',
  reconstruction: 'Reconstruction',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-secondary text-secondary-foreground',
  high: 'bg-warning text-warning-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
};

interface ProjectHQProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<any>;
}

export function ProjectHQ({ project, onUpdate }: ProjectHQProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const tools = [
    { id: 'photos', label: 'Photos', icon: Camera, description: 'Damage photos, before/after documentation' },
    { id: 'notes', label: 'Job Notes', icon: StickyNote, description: 'Field notes & team updates' },
    { id: 'tasks', label: 'Punch List', icon: ClipboardList, description: 'Tasks, action items & assignments' },
    { id: 'docs', label: 'Documents', icon: FileText, description: 'Contracts, invoices, scope sheets' },
    { id: 'schedule', label: 'Timeline', icon: Calendar, description: 'Milestones & scheduling' },
    { id: 'chat', label: 'Job Chat', icon: MessageCircle, description: 'Real-time crew communication' },
  ];

  const advancedTools = [
    { id: 'team', label: 'Crew & Contacts', icon: Users },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
    { id: 'workflow', label: 'Phase Handoffs', icon: GitBranch },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      lead: 'New Lead',
      opportunity: 'Pending Approval',
      active: 'In Progress',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen">
      {/* Job Header */}
      <div className={`bg-gradient-to-r ${LOSS_TYPE_COLORS[project.loss_type] || LOSS_TYPE_COLORS.other} text-white`}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {LOSS_TYPE_ICONS[project.loss_type] || LOSS_TYPE_ICONS.other}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                    {project.project_number}
                  </span>
                  <Badge className={`${PRIORITY_COLORS[project.priority] || ''} border-0 text-xs`}>
                    {project.priority?.toUpperCase()}
                  </Badge>
                </div>
                <h1 className="text-2xl font-headline font-bold">{project.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                  {project.address && (
                    <span>
                      {project.address}{project.city && `, ${project.city}`}{project.state && `, ${project.state}`} {project.zip}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {JOB_TYPE_LABELS[project.job_type] || project.job_type}
                  </Badge>
                  {project.insurance_carrier && (
                    <Badge variant="secondary" className="bg-white/10 text-white/80 border-0 backdrop-blur-sm">
                      <Shield className="h-3 w-3 mr-1" />
                      {project.insurance_carrier}
                    </Badge>
                  )}
                  {project.loss_date && (
                    <span className="text-white/60">
                      Loss: {new Date(project.loss_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-sm">
                {getStatusLabel(project.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0 gap-1 overflow-x-auto">
              <TabsTrigger value="home" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Photos
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Job Notes
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Punch List
              </TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Documents
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="more" className="data-[state=active]:bg-muted data-[state=active]:shadow-none">
                More
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview / Home */}
          <TabsContent value="home" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {tools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="hover:shadow-lg hover:shadow-accent/10 cursor-pointer transition-all hover:-translate-y-1"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-accent/10 rounded-lg">
                        <tool.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{tool.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Loss information, insurance, property owner, and project financials</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectOverview project={project} onUpdate={onUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos */}
          <TabsContent value="photos" className="mt-0">
            <PhotoGallery projectId={project.id} />
          </TabsContent>

          {/* Job Notes (was Message Board) */}
          <TabsContent value="notes" className="mt-0">
            <ProjectMessageBoard projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* Punch List (was To-dos) */}
          <TabsContent value="tasks" className="mt-0">
            <ProjectTodos projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* Documents */}
          <TabsContent value="docs" className="mt-0">
            <ProjectDocuments projectId={project.id} />
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="schedule" className="mt-0">
            <ProjectTimeline project={project} onUpdate={onUpdate} />
          </TabsContent>

          {/* Job Chat (was Campfire) */}
          <TabsContent value="chat" className="mt-0">
            <ProjectCampfire projectId={project.id} projectName={project.name} />
          </TabsContent>

          {/* Crew & Contacts */}
          <TabsContent value="team" className="mt-0">
            <ProjectTeamMembers projectId={project.id} />
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {advancedTools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-secondary rounded-lg">
                        <tool.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-sm">{tool.label}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Time Tracking */}
          <TabsContent value="time" className="mt-0">
            <TimeTracker projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* Budget & Expenses */}
          <TabsContent value="budget" className="mt-0">
            <div className="space-y-6">
              <ProjectBudgetTracker 
                estimatedCost={project.estimated_cost} 
                actualCost={project.actual_cost}
              />
              <ExpenseSubmission projectId={project.id} />
              <ExpenseList projectId={project.id} />
            </div>
          </TabsContent>

          {/* Phase Handoffs */}
          <TabsContent value="workflow" className="mt-0">
            <WorkflowHandoffs projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity" className="mt-0">
            <ProjectActivityLog projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
