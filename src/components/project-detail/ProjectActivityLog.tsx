import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ProjectActivityLogProps {
  projectId: string;
}

type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
};

export default function ProjectActivityLog({ projectId }: ProjectActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching activity log:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-500 text-white';
      case 'updated': return 'bg-blue-500 text-white';
      case 'deleted': return 'bg-red-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatActivityMessage = (activity: ActivityLog) => {
    const entityType = activity.entity_type || 'item';
    return `${activity.action} ${entityType}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>Recent project activity and changes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 p-3 border rounded-lg animate-pulse">
                <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  {index < activities.length - 1 && (
                    <div className="absolute left-1/2 top-4 w-px h-full bg-border -translate-x-1/2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm">
                      <Badge className={getActionColor(activity.action)} variant="secondary">
                        {activity.action.toUpperCase()}
                      </Badge>
                      <span className="ml-2">{formatActivityMessage(activity)}</span>
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {activity.details && (
                    <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                      {activity.details.name && (
                        <p>
                          <span className="font-medium">Name:</span> {activity.details.name}
                        </p>
                      )}
                      {activity.details.status && (
                        <p>
                          <span className="font-medium">Status:</span> {activity.details.status}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
