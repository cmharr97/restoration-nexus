import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MessageSquare, 
  CheckSquare, 
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
  GitBranch
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

const PROJECT_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="h-8 w-8" />,
  fire: <Flame className="h-8 w-8" />,
  mold: <Bug className="h-8 w-8" />,
  storm: <CloudLightning className="h-8 w-8" />,
  reconstruction: <Hammer className="h-8 w-8" />,
  other: <HelpCircle className="h-8 w-8" />,
};

const PROJECT_COLORS: Record<string, string> = {
  water: 'from-blue-500 to-blue-600',
  fire: 'from-orange-500 to-red-500',
  mold: 'from-emerald-500 to-green-600',
  storm: 'from-purple-500 to-violet-600',
  reconstruction: 'from-slate-500 to-gray-600',
  other: 'from-gray-500 to-gray-600',
};

interface ProjectHQProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<any>;
}

export function ProjectHQ({ project, onUpdate }: ProjectHQProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const tools = [
    { id: 'messages', label: 'Message Board', icon: MessageSquare, description: 'Team discussions & updates' },
    { id: 'todos', label: 'To-dos', icon: CheckSquare, description: 'Track tasks & assignments' },
    { id: 'docs', label: 'Docs & Files', icon: FileText, description: 'Shared documents & photos' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Timeline & milestones' },
    { id: 'campfire', label: 'Campfire', icon: Flame, description: 'Real-time team chat' },
    { id: 'team', label: 'Team', icon: Users, description: 'Project members' },
  ];

  const advancedTools = [
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen">
      {/* Project Header - Basecamp Style */}
      <div className={`bg-gradient-to-r ${PROJECT_COLORS[project.loss_type] || PROJECT_COLORS.other} text-white`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
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
                {PROJECT_ICONS[project.loss_type] || PROJECT_ICONS.other}
              </div>
              <div>
                <h1 className="text-3xl font-headline font-bold">{project.name}</h1>
                <p className="text-white/80 font-mono text-sm mt-1">
                  {project.project_number}
                </p>
                {project.address && (
                  <p className="text-white/70 text-sm mt-1">
                    {project.address}{project.city && `, ${project.city}`}{project.state && `, ${project.state}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-sm">
                {project.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0 gap-1">
              <TabsTrigger 
                value="home" 
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Home
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="todos"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                To-dos
              </TabsTrigger>
              <TabsTrigger 
                value="docs"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Docs & Files
              </TabsTrigger>
              <TabsTrigger 
                value="schedule"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="campfire"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Campfire
              </TabsTrigger>
              <TabsTrigger 
                value="more"
                className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                More
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab - Tool Grid */}
          <TabsContent value="home" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="hover:shadow-lg hover:shadow-accent/10 cursor-pointer transition-all hover:-translate-y-1"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <tool.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tool.label}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Project Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Key information about this restoration project</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectOverview project={project} onUpdate={onUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-0">
            <ProjectMessageBoard projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* To-dos Tab */}
          <TabsContent value="todos" className="mt-0">
            <ProjectTodos projectId={project.id} organizationId={project.organization_id} />
          </TabsContent>

          {/* Docs & Files Tab */}
          <TabsContent value="docs" className="mt-0">
            <ProjectDocuments projectId={project.id} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-0">
            <ProjectTimeline project={project} onUpdate={onUpdate} />
          </TabsContent>

          {/* Campfire Tab */}
          <TabsContent value="campfire" className="mt-0">
            <ProjectCampfire projectId={project.id} projectName={project.name} />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-0">
            <ProjectTeamMembers projectId={project.id} />
          </TabsContent>

          {/* More Tab - Advanced Tools */}
          <TabsContent value="more" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {advancedTools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-secondary rounded-lg">
                        <tool.icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">{tool.label}</h3>
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

          {/* Budget */}
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

          {/* Workflow */}
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
