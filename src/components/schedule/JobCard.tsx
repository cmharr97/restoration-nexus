import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
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
}

export function JobCard({ job, isDragging }: JobCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 bg-card border rounded-lg cursor-move hover:shadow-md transition-all',
        isDragging && 'opacity-50',
        job.priority === 'urgent' && 'border-destructive'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-1">{job.name}</h4>
        <Badge className={cn('text-xs', getJobTypeColor(job.job_type))}>
          {job.job_type}
        </Badge>
      </div>
      
      {job.address && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{job.address}</span>
        </div>
      )}

      {job.assigned_profile && (
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
