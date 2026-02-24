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
  LayoutGrid, List, Shield, Calendar as CalendarIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LOSS_TYPE_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="h-5 w-5" />,
  fire: <Flame className="h-5 w-5" />,
  mold: <Bug className="h-5 w-5" />,
  storm: <CloudLightning className="h-5 w-5" />,
  reconstruction: <Hammer className="h-5 w-5" />,
  other: <HelpCircle className="h-5 w-5" />,
};

const LOSS_TYPE_COLORS: Record<string, string> = {
  water: 'bg-blue-600',
  fire: 'bg-orange-600',
  mold: 'bg-emerald-600',
  storm: 'bg-purple-600',
  reconstruction: 'bg-slate-600',
  other: 'bg-gray-600',
};

const LOSS_TYPE_LABELS: Record<string, string> = {
  water: 'Water',
  fire: 'Fire/Smoke',
  mold: 'Mold',
  storm: 'Storm',
  reconstruction: 'Rebuild',
  other: 'Other',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  inspection: 'Inspection',
  recon: 'Recon',
  mitigation: 'Mitigation',
  contents: 'Contents',
  reconstruction: 'Reconstruction',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  lead: { label: 'New Lead', className: 'bg-info text-info-foreground' },
  opportunity: { label: 'Pending', className: 'bg-accent/20 text-accent' },
  active: { label: 'In Progress', className: 'bg-success text-success-foreground' },
  on_hold: { label: 'On Hold', className: 'bg-warning text-warning-foreground' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive text-destructive-foreground' },
};

const PRIORITY_INDICATORS: Record<string, string> = {
  urgent: 'border-l-4 border-l-destructive',
  high: 'border-l-4 border-l-warning',
  medium: '',
  low: '',
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
      project.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.claim_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.insurance_carrier?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background lg:ml-64 mt-16">
        {/* Header */}
        <div className="sticky top-16 bg-background border-b border-border z-30 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-headline font-bold">Jobs</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredProjects.length} job{filteredProjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button className="bg-accent hover:bg-accent/90 gap-2" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, claim #, customer, carrier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="lead">New Leads</SelectItem>
                  <SelectItem value="active">In Progress</SelectItem>
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

        {/* Jobs */}
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
                    ? 'No jobs match your filters' 
                    : 'No jobs yet — create your first restoration job'}
                </p>
                <Button className="bg-accent hover:bg-accent/90" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="group">
                  <Card className={`h-full hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${PRIORITY_INDICATORS[project.priority] || ''}`}>
                    <div className={`${LOSS_TYPE_COLORS[project.loss_type] || LOSS_TYPE_COLORS.other} p-5 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            {LOSS_TYPE_ICONS[project.loss_type] || LOSS_TYPE_ICONS.other}
                          </div>
                          <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                            {project.project_number}
                          </span>
                        </div>
                        <Badge variant="secondary" className={`${STATUS_CONFIG[project.status]?.className || 'bg-secondary text-secondary-foreground'} border-0 text-xs`}>
                          {STATUS_CONFIG[project.status]?.label || project.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold mt-3 line-clamp-1 group-hover:underline">
                        {project.name}
                      </h3>
                      {project.address && (
                        <p className="text-white/70 text-xs mt-1 line-clamp-1">
                          {project.address}{project.city && `, ${project.city}`}
                        </p>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {JOB_TYPE_LABELS[project.job_type] || project.job_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {LOSS_TYPE_LABELS[project.loss_type] || project.loss_type}
                        </Badge>
                      </div>

                      {(project.insurance_carrier || project.owner_name) && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {project.owner_name && (
                            <p className="truncate">Customer: {project.owner_name}</p>
                          )}
                          {project.insurance_carrier && (
                            <p className="flex items-center gap-1 truncate">
                              <Shield className="h-3 w-3" />
                              {project.insurance_carrier}
                              {project.claim_number && ` • #${project.claim_number}`}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        {project.loss_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Loss: {new Date(project.loss_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className={`hover:shadow-md transition-shadow ${PRIORITY_INDICATORS[project.priority] || ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`${LOSS_TYPE_COLORS[project.loss_type] || LOSS_TYPE_COLORS.other} p-2.5 rounded-lg text-white`}>
                          {LOSS_TYPE_ICONS[project.loss_type] || LOSS_TYPE_ICONS.other}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            <Badge className={`${STATUS_CONFIG[project.status]?.className || 'bg-secondary text-secondary-foreground'} border-0 text-xs`}>
                              {STATUS_CONFIG[project.status]?.label || project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono text-xs">{project.project_number}</span>
                            {project.address && <span>• {project.address}</span>}
                            {project.insurance_carrier && (
                              <span className="flex items-center gap-1">
                                • <Shield className="h-3 w-3" /> {project.insurance_carrier}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <Badge variant="outline" className="text-xs">
                            {JOB_TYPE_LABELS[project.job_type] || project.job_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                          </p>
                        </div>
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
