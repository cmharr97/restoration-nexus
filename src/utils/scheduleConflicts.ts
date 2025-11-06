export interface TimeSlot {
  start: string;
  end: string;
}

export interface ScheduleAssignment {
  id: string;
  start_time: string;
  end_time: string;
  projects?: {
    name: string;
  };
}

export interface Conflict {
  job: string;
  time: string;
}

export function detectConflicts(
  newSlot: TimeSlot,
  existingAssignments: ScheduleAssignment[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  const newStart = timeToMinutes(newSlot.start);
  const newEnd = timeToMinutes(newSlot.end);

  for (const assignment of existingAssignments) {
    const existingStart = timeToMinutes(assignment.start_time);
    const existingEnd = timeToMinutes(assignment.end_time);

    // Check for overlap
    if (
      (newStart >= existingStart && newStart < existingEnd) || // New starts during existing
      (newEnd > existingStart && newEnd <= existingEnd) || // New ends during existing
      (newStart <= existingStart && newEnd >= existingEnd) // New encompasses existing
    ) {
      conflicts.push({
        job: assignment.projects?.name || 'Unknown Job',
        time: `${assignment.start_time} - ${assignment.end_time}`,
      });
    }
  }

  return conflicts;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function hasConflict(
  startTime: string,
  endTime: string,
  assignments: ScheduleAssignment[]
): boolean {
  return detectConflicts({ start: startTime, end: endTime }, assignments).length > 0;
}
