import { useDroppable } from '@dnd-kit/core';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MonthViewProps {
  currentDate: Date;
  jobs: any[];
  schedules: any[];
  onDateClick?: (date: Date) => void;
}

export function MonthView({ currentDate, jobs, schedules, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-[600px] flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            currentMonth={currentDate}
            jobs={jobs}
            schedules={schedules}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  jobs: any[];
  schedules: any[];
  onDateClick?: (date: Date) => void;
}

function DayCell({ date, currentMonth, jobs, schedules, onDateClick }: DayCellProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { date: dateStr, type: 'day' },
  });

  const isToday = isSameDay(date, new Date());
  const isCurrentMonth = isSameMonth(date, currentMonth);

  // Count jobs for this day
  const daySchedules = schedules.filter((s: any) => s.date === dateStr);
  const jobCount = daySchedules.reduce((acc: number, schedule: any) => {
    return acc + (schedule.assignments?.length || 0);
  }, 0);

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick?.(date)}
      className={cn(
        'border rounded-lg p-2 min-h-[80px] transition-colors cursor-pointer relative',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
        isOver && 'bg-accent/20 border-accent',
        isToday && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn(
          'text-sm font-medium',
          isToday && 'bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center'
        )}>
          {format(date, 'd')}
        </span>
        {jobCount > 0 && (
          <Badge variant="secondary" className="text-xs h-5">
            {jobCount}
          </Badge>
        )}
      </div>

      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 rounded-lg">
          <span className="text-xs text-accent font-medium">Drop here</span>
        </div>
      )}
    </div>
  );
}
