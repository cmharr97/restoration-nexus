import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import Navigation from '@/components/Navigation';
import { Plus, Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Projects() {
  const { projects, loading, createProject } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lossTypeFilter, setLossTypeFilter] = useState<string>('all');
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
    const matchesLossType = lossTypeFilter === 'all' || project.loss_type === lossTypeFilter;

    return matchesSearch && matchesStatus && matchesLossType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'on_hold':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'lead':
        return 'bg-info text-info-foreground';
      case 'opportunity':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLossTypeColor = (lossType: string) => {
    switch (lossType) {
      case 'water':
        return 'bg-blue-500 text-white';
      case 'fire':
        return 'bg-orange-500 text-white';
      case 'mold':
        return 'bg-green-500 text-white';
      case 'storm':
        return 'bg-purple-500 text-white';
      case 'reconstruction':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="fixed top-16 left-64 right-0 bg-background border-b border-border z-40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your restoration projects and claims
            </p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex gap-4">
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
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lossTypeFilter} onValueChange={setLossTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="mold">Mold</SelectItem>
              <SelectItem value="storm">Storm</SelectItem>
              <SelectItem value="reconstruction">Reconstruction</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-52 pb-8 px-6 ml-64">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-muted" />
                <CardContent className="h-24 bg-muted/50 mt-4" />
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || lossTypeFilter !== 'all' ? (
                  <>
                    <p className="text-lg font-medium mb-2">No projects found</p>
                    <p>Try adjusting your filters or search query</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No projects yet</p>
                    <p className="mb-4">Get started by creating your first project</p>
                    <Button className="bg-accent hover:bg-accent/90" onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => window.location.href = `/projects/${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getLossTypeColor(project.loss_type)}>
                      {project.loss_type.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="font-headline text-xl group-hover:text-accent transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {project.project_number || 'No project number'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-2">
                        {project.address}
                        {project.city && `, ${project.city}`}
                        {project.state && `, ${project.state}`}
                      </span>
                    </div>
                  )}
                  {project.loss_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Loss: {new Date(project.loss_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.estimated_cost && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Est: ${project.estimated_cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
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
