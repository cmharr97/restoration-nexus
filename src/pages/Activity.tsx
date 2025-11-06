import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Users, 
  FolderKanban,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

export default function ActivityFeed() {
  return (
    <ProtectedRoute requireOrganization>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <ActivityFeedContent />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function ActivityFeedContent() {
  const { organization } = useOrganization();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (organization) {
      fetchActivities();
    }
  }, [organization]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const activities: any[] = [];

      // Fetch recent projects
      const { data: projects } = await (supabase
        .from('projects' as any)
        .select('*, created_by_user:profiles!projects_created_by_fkey(full_name, email)')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false })
        .limit(10) as any);

      if (projects) {
        activities.push(...(projects as any[]).map((p: any) => ({
          id: `project-${p.id}`,
          type: 'project',
          action: 'created',
          entity: p.name,
          user: p.created_by_user?.full_name || p.created_by_user?.email,
          timestamp: p.created_at,
          details: p,
        })));
      }

      // Fetch recent announcements
      const { data: announcements } = await (supabase
        .from('announcements' as any)
        .select('*, created_by_user:profiles!announcements_created_by_fkey(full_name, email)')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false })
        .limit(10) as any);

      if (announcements) {
        activities.push(...(announcements as any[]).map((a: any) => ({
          id: `announcement-${a.id}`,
          type: 'announcement',
          action: 'posted',
          entity: a.title,
          user: a.created_by_user?.full_name || a.created_by_user?.email,
          timestamp: a.created_at,
          details: a,
        })));
      }

      // Fetch recent tasks
      const { data: tasks } = await (supabase
        .from('tasks' as any)
        .select(`
          *,
          task_list:task_list_id(
            name,
            organization_id
          ),
          created_by_user:profiles!tasks_created_by_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10) as any);

      if (tasks) {
        activities.push(...(tasks as any[]).map((t: any) => ({
          id: `task-${t.id}`,
          type: 'task',
          action: t.is_completed ? 'completed' : 'created',
          entity: t.title,
          user: t.created_by_user?.full_name || t.created_by_user?.email,
          timestamp: t.is_completed ? t.completed_at : t.created_at,
          details: t,
        })));
      }

      // Fetch recent check-ins
      const { data: checkIns } = await (supabase
        .from('check_ins' as any)
        .select('*, user:profiles!check_ins_user_id_fkey(full_name, email)')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false })
        .limit(10) as any);

      if (checkIns) {
        activities.push(...(checkIns as any[]).map((c: any) => ({
          id: `checkin-${c.id}`,
          type: 'check_in',
          action: 'submitted',
          entity: 'Daily Check-in',
          user: c.user?.full_name || c.user?.email,
          timestamp: c.created_at,
          details: c,
        })));
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="h-4 w-4" />;
      case 'announcement':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'check_in':
        return <FileText className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-info/10 text-info border-info/20';
      case 'announcement':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'task':
        return 'bg-success/10 text-success border-success/20';
      case 'check_in':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    if (searchQuery && !activity.entity.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Activity className="h-8 w-8 text-accent" />
          Activity Feed
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time updates across all your projects and teams
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="check_in">Check-ins</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchActivities} size="icon">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No activities to display</p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:border-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          {' '}
                          <span className="text-muted-foreground">{activity.action}</span>
                          {' '}
                          <span className="font-medium">{activity.entity}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className={getActivityColor(activity.type)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Additional context based on type */}
                    {activity.type === 'announcement' && activity.details.category && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Category: {activity.details.category}
                      </div>
                    )}
                    {activity.type === 'project' && activity.details.status && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.details.status}
                        </Badge>
                      </div>
                    )}
                    {activity.type === 'task' && activity.details.task_list && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        List: {activity.details.task_list.name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}