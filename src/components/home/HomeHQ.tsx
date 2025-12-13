import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Droplets, 
  Flame, 
  Bug, 
  CloudLightning, 
  Hammer, 
  HelpCircle,
  MessageSquare,
  CheckSquare,
  FileText,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CreateProjectDialog from '@/components/CreateProjectDialog';

const PROJECT_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="h-6 w-6" />,
  fire: <Flame className="h-6 w-6" />,
  mold: <Bug className="h-6 w-6" />,
  storm: <CloudLightning className="h-6 w-6" />,
  reconstruction: <Hammer className="h-6 w-6" />,
  other: <HelpCircle className="h-6 w-6" />,
};

const PROJECT_COLORS: Record<string, string> = {
  water: 'bg-blue-500',
  fire: 'bg-orange-500',
  mold: 'bg-emerald-500',
  storm: 'bg-purple-500',
  reconstruction: 'bg-slate-500',
  other: 'bg-gray-500',
};

export function HomeHQ() {
  const { projects, loading, createProject } = useProjects();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  useEffect(() => {
    // Fetch recent activity
    const fetchActivity = async () => {
      const { data } = await supabase
        .from('project_activity_log')
        .select('*, profiles:user_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setRecentActivity(data);
    };
    fetchActivity();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active');
  const pinnedProjects = projects.slice(0, 6); // Show first 6 as "pinned"

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your restoration projects, organized and on track. Here's what's happening today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent">{activeProjects.length}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{projects.filter(p => p.status === 'lead').length}</div>
            <div className="text-sm text-muted-foreground">New Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{projects.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid - Basecamp Style */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold">Your Projects</h2>
          <Button 
            className="bg-accent hover:bg-accent/90 gap-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-48" />
            ))}
          </div>
        ) : pinnedProjects.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button 
                className="bg-accent hover:bg-accent/90"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedProjects.map((project) => (
              <Link 
                key={project.id} 
                to={`/projects/${project.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Project Header with Icon */}
                  <div className={`${PROJECT_COLORS[project.loss_type] || PROJECT_COLORS.other} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        {PROJECT_ICONS[project.loss_type] || PROJECT_ICONS.other}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-0 backdrop-blur-sm"
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mt-4 line-clamp-1 group-hover:underline">
                      {project.name}
                    </h3>
                    <p className="text-white/80 text-sm mt-1 font-mono">
                      {project.project_number}
                    </p>
                  </div>

                  {/* Project Details */}
                  <CardContent className="p-4">
                    {project.address && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                        {project.address}{project.city && `, ${project.city}`}
                      </p>
                    )}

                    {/* Quick Access Icons */}
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Messages</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>To-dos</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Docs</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-card">
                          <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                            RC
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Add New Project Card */}
            <Card 
              className="h-full border-dashed border-2 hover:border-accent/50 cursor-pointer transition-colors flex items-center justify-center min-h-[200px]"
              onClick={() => setCreateDialogOpen(true)}
            >
              <CardContent className="text-center p-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-accent" />
                </div>
                <p className="font-medium">New Project</p>
                <p className="text-sm text-muted-foreground">Start tracking a new job</p>
              </CardContent>
            </Card>
          </div>
        )}

        {projects.length > 6 && (
          <div className="text-center mt-6">
            <Button variant="ghost" asChild>
              <Link to="/projects" className="gap-2">
                View all {projects.length} projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Recent Activity - Basecamp Style */}
      <div>
        <h2 className="text-2xl font-headline font-bold mb-6">Recent Activity</h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary">
                        {activity.profiles?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.profiles?.full_name || 'Someone'}</span>
                        {' '}{activity.action}{' '}
                        <span className="text-muted-foreground">{activity.entity_type}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/schedule">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Schedule</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/team-chat">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Team Chat</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/tasks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Tasks</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/announcements">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Announcements</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (data) => { await createProject(data as any); }}
      />
    </div>
  );
}
