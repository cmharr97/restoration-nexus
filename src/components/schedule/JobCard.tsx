import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Flame, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: {
    id: string;
    name: string;
    job_type: string;
    address?: string;
    status: string;
    priority: string;
    assigned_profile?: {
      full_name?: string;
      email: string;
    };
  };
  isDragging?: boolean;
  showTime?: boolean;
  startTime?: string;
  endTime?: string;
}

export function JobCard({ job, isDragging, showTime, startTime, endTime }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job.id,
    data: job,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mitigation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      contents: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      reconstruction: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colors[type] || colors.mitigation;
  };

  const getPriorityStyles = (priority: string) => {
    if (priority === 'urgent') return 'border-destructive border-2 shadow-destructive/20 shadow-md';
    if (priority === 'high') return 'border-orange-500 bg-orange-500/5';
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 bg-card border rounded-lg cursor-move hover:shadow-md transition-all relative',
        isDragging && 'opacity-50',
        getPriorityStyles(job.priority)
      )}
    >
      {job.priority === 'urgent' && (
        <div className="absolute -top-1 -right-1">
          <Flame className="h-4 w-4 text-destructive fill-destructive" />
        </div>
      )}
      {job.priority === 'high' && (
        <div className="absolute -top-1 -right-1">
          <AlertTriangle className="h-4 w-4 text-orange-500 fill-orange-500" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-1">{job.name}</h4>
        <Badge className={cn('text-xs', getJobTypeColor(job.job_type))}>
          {job.job_type}
        </Badge>
      </div>
      
      {showTime && startTime && endTime && (
        <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
          <Clock className="h-3 w-3" />
          <span>{startTime} - {endTime}</span>
        </div>
      )}

      {job.address && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{job.address}</span>
        </div>
      )}

      {job.assigned_profile && !showTime && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="line-clamp-1">
            {job.assigned_profile.full_name || job.assigned_profile.email}
          </span>
        </div>
      )}
    </div>
  );
}
