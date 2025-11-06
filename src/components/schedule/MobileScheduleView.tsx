import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { format, addDays, startOfWeek } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';

interface MobileScheduleViewProps {
  schedules: any[];
  members: any[];
  onReassign: (assignmentId: string, newUserId: string) => Promise<void>;
}

export function MobileScheduleView({ schedules, members, onReassign }: MobileScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentDate(addDays(currentDate, 1)),
    onSwipedRight: () => setCurrentDate(addDays(currentDate, -1)),
    trackMouse: true,
  });

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter((s: any) => s.date === dateStr);
  };

  const handleReassignClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setNewAssignee('');
    setShowReassignDialog(true);
  };

  const handleConfirmReassign = async () => {
    if (!selectedAssignment || !newAssignee) return;
    
    await onReassign(selectedAssignment.id, newAssignee);
    setShowReassignDialog(false);
    setSelectedAssignment(null);
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mitigation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      contents: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      reconstruction: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colors[type] || colors.mitigation;
  };

  const currentSchedules = getSchedulesForDate(currentDate);

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(addDays(currentDate, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold font-headline">
            {format(currentDate, 'EEEE')}
          </h2>
          <p className="text-muted-foreground">
            {format(currentDate, 'MMM d, yyyy')}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
          const hasSchedules = getSchedulesForDate(day).length > 0;
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={`
                p-2 rounded-lg text-center transition-colors
                ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                ${hasSchedules && !isToday ? 'ring-2 ring-accent' : ''}
              `}
            >
              <div className="text-xs">{format(day, 'EEE')}</div>
              <div className="text-lg font-bold">{format(day, 'd')}</div>
            </button>
          );
        })}
      </div>

      {/* Swipeable Schedule Cards */}
      <div {...handlers} className="min-h-[400px] space-y-3">
        {currentSchedules.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No jobs scheduled for this day</p>
            <p className="text-sm text-muted-foreground mt-2">
              Swipe left/right to navigate days
            </p>
          </Card>
        ) : (
          currentSchedules.map((schedule: any) => (
            <div key={schedule.id}>
              {/* Team Member Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  {schedule.user_id ? 'TM' : 'UN'}
                </div>
                <span className="font-medium">Team Member</span>
              </div>

              {/* Assignments */}
              {schedule.assignments?.map((assignment: any) => (
                <Card
                  key={assignment.id}
                  className="p-4 mb-2 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {assignment.projects?.name || 'Untitled Job'}
                        </h3>
                        <Badge className={getJobTypeColor(assignment.projects?.job_type)}>
                          {assignment.projects?.job_type}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReassignClick(assignment)}
                        className="gap-1"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        Reassign
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {assignment.start_time?.substring(0, 5)} - {assignment.end_time?.substring(0, 5)}
                      </span>
                    </div>

                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Reassignment Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Job</DialogTitle>
            <DialogDescription>
              Select a new team member for this job
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Job Details:</p>
              <p className="text-sm text-muted-foreground">
                {selectedAssignment?.projects?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedAssignment?.start_time?.substring(0, 5)} - {selectedAssignment?.end_time?.substring(0, 5)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Assignee</label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member: any) => (
                    <SelectItem key={member.id} value={member.user_id}>
                      {member.profiles?.full_name || member.profiles?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowReassignDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmReassign}
                disabled={!newAssignee}
              >
                Confirm Reassign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swipe Hint */}
      <div className="text-center text-sm text-muted-foreground">
        👈 Swipe to navigate between days 👉
      </div>
    </div>
  );
}
