import { useDroppable } from '@dnd-kit/core';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface WeekViewProps {
  currentDate: Date;
  jobs: any[];
  schedules: any[];
  members: any[];
  onDateClick?: (date: Date) => void;
}

export function WeekView({ currentDate, jobs, schedules, members, onDateClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-2 h-[600px]">
      {weekDays.map((day) => (
        <DayColumn
          key={day.toISOString()}
          date={day}
          jobs={jobs}
          schedules={schedules}
          members={members}
          isToday={isSameDay(day, new Date())}
          onDateClick={onDateClick}
        />
      ))}
    </div>
  );
}

interface DayColumnProps {
  date: Date;
  jobs: any[];
  schedules: any[];
  members: any[];
  isToday: boolean;
  onDateClick?: (date: Date) => void;
}

function DayColumn({ date, jobs, schedules, members, isToday, onDateClick }: DayColumnProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { date: dateStr, type: 'day' },
  });

  // Get jobs scheduled for this day
  const daySchedules = schedules.filter(
    (s: any) => s.date === dateStr
  );

  const scheduledJobs = jobs.filter((job: any) => {
    return daySchedules.some((schedule: any) => 
      schedule.assignments?.some((a: any) => a.project_id === job.id)
    );
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick?.(date)}
      className={cn(
        'border rounded-lg p-2 min-h-[200px] transition-colors cursor-pointer',
        isOver && 'bg-accent/20 border-accent',
        isToday && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium">{format(date, 'EEE')}</div>
          <div className={cn(
            'text-2xl font-bold',
            isToday && 'text-primary'
          )}>
            {format(date, 'd')}
          </div>
        </div>
        {daySchedules.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {daySchedules.length}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {scheduledJobs.map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {isOver && (
        <div className="mt-2 p-2 border-2 border-dashed border-accent rounded text-xs text-center text-muted-foreground">
          Drop here to schedule
        </div>
      )}
    </div>
  );
}
