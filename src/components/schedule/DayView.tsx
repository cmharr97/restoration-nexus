import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { hasConflict } from '@/utils/scheduleConflicts';
import { useState } from 'react';

interface DayViewProps {
  currentDate: Date;
  jobs: any[];
  schedules: any[];
  members: any[];
}

export function DayView({ currentDate, jobs, schedules, members }: DayViewProps) {
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  
  // Get schedules for this specific day grouped by member
  const daySchedules = schedules.filter((s: any) => s.date === dateStr);

  return (
    <div className="space-y-4">
      <div className="text-center py-4 border-b">
        <h2 className="text-3xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Unassigned jobs section */}
        <UnassignedJobsSection
          dateStr={dateStr}
          jobs={jobs}
          schedules={daySchedules}
        />

        {/* Member schedules */}
        {members.map((member: any) => (
          <MemberScheduleRow
            key={member.id}
            member={member}
            dateStr={dateStr}
            jobs={jobs}
            schedules={daySchedules}
            isHovered={hoveredMember === member.profiles.id}
            onHoverChange={setHoveredMember}
          />
        ))}
      </div>
    </div>
  );
}

interface UnassignedJobsSectionProps {
  dateStr: string;
  jobs: any[];
  schedules: any[];
}

function UnassignedJobsSection({ dateStr, jobs, schedules }: UnassignedJobsSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `unassigned-${dateStr}`,
    data: { date: dateStr, type: 'unassigned' },
  });

  const scheduledJobIds = new Set(
    schedules.flatMap((s: any) => 
      s.assignments?.map((a: any) => a.project_id) || []
    )
  );

  const unassignedJobs = jobs.filter((job: any) => !scheduledJobIds.has(job.id));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 border-2 border-dashed rounded-lg transition-colors',
        isOver && 'bg-accent/20 border-accent'
      )}
    >
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        Unassigned Jobs
        <Badge variant="secondary">{unassignedJobs.length}</Badge>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {unassignedJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-4">
            All jobs are assigned for this day
          </p>
        ) : (
          unassignedJobs.map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}

interface MemberScheduleRowProps {
  member: any;
  dateStr: string;
  jobs: any[];
  schedules: any[];
  isHovered: boolean;
  onHoverChange: (memberId: string | null) => void;
}

function MemberScheduleRow({ member, dateStr, jobs, schedules, isHovered, onHoverChange }: MemberScheduleRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `member-${member.profiles.id}-${dateStr}`,
    data: { 
      date: dateStr, 
      userId: member.profiles.id,
      type: 'member' 
    },
  });

  const memberSchedule = schedules.find((s: any) => s.user_id === member.profiles.id);
  const assignments = memberSchedule?.assignments || [];
  const assignedJobIds = assignments.map((a: any) => a.project_id);
  const memberJobs = jobs.filter((job: any) => assignedJobIds.includes(job.id));

  // Check for conflicts
  const hasConflicts = assignments.length > 1 && assignments.some((a: any, i: number) => 
    assignments.slice(i + 1).some((b: any) => 
      hasConflict(a.start_time, a.end_time, [b])
    )
  );

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => onHoverChange(member.profiles.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={cn(
        'p-4 border rounded-lg transition-all',
        isOver && 'bg-accent/10 border-accent ring-2 ring-accent/50',
        !memberSchedule?.is_available && 'bg-muted/30',
        isHovered && 'shadow-md'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.profiles.avatar_url || ''} />
            <AvatarFallback>
              {(member.profiles.full_name || member.profiles.email)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {member.profiles.full_name || member.profiles.email}
            </h3>
            <p className="text-sm text-muted-foreground">
              {memberSchedule?.start_time && memberSchedule?.end_time
                ? `${memberSchedule.start_time} - ${memberSchedule.end_time}`
                : 'No schedule set'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={memberSchedule?.is_available ? 'default' : 'secondary'}>
            {memberSchedule?.is_available ? 'Available' : 'Unavailable'}
          </Badge>
          {memberJobs.length > 0 && (
            <Badge variant="outline">{memberJobs.length} jobs</Badge>
          )}
          {hasConflicts && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Conflicts
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {memberJobs.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed rounded-lg text-sm text-muted-foreground">
            Drop jobs here to assign
          </div>
        ) : (
          memberJobs.map((job: any) => {
            const assignment = assignments.find((a: any) => a.project_id === job.id);
            return (
              <JobCard 
                key={job.id} 
                job={job}
                showTime
                startTime={assignment?.start_time}
                endTime={assignment?.end_time}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
