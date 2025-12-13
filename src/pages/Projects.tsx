import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import Navigation from '@/components/Navigation';
import { 
  Plus, Search, Droplets, Flame, Bug, CloudLightning, Hammer, HelpCircle,
  MessageSquare, CheckSquare, FileText, LayoutGrid, List
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export default function Projects() {
  const { projects, loading, createProject } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create')) {
      setCreateDialogOpen(true);
    }
  }, [location.search]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'on_hold': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'lead': return 'bg-info text-info-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background lg:ml-64 mt-16">
        {/* Header */}
        <div className="sticky top-16 bg-background border-b border-border z-30 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-headline font-bold">All Projects</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button className="bg-accent hover:bg-accent/90 gap-2" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse h-48" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No projects match your filters' 
                    : 'No projects yet'}
                </p>
                <Button className="bg-accent hover:bg-accent/90" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="group">
                  <Card className="h-full hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className={`${PROJECT_COLORS[project.loss_type] || PROJECT_COLORS.other} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          {PROJECT_ICONS[project.loss_type] || PROJECT_ICONS.other}
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
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
                    <CardContent className="p-4">
                      {project.address && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                          {project.address}{project.city && `, ${project.city}`}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <CheckSquare className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                      </div>
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
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`${PROJECT_COLORS[project.loss_type] || PROJECT_COLORS.other} p-3 rounded-lg text-white`}>
                          {PROJECT_ICONS[project.loss_type] || PROJECT_ICONS.other}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            <Badge className={getStatusColor(project.status)} variant="secondary">
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.project_number}
                            {project.address && ` • ${project.address}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              navigate('/projects', { replace: true });
            }
          }}
          onSubmit={async (data) => { await createProject(data as any); }}
        />
      </div>
    </>
  );
}
