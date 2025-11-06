import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobName: string;
  memberName?: string;
  date: string;
  conflicts: Array<{ job: string; time: string }>;
  onConfirm: (startTime: string, endTime: string) => void;
}

export function TimeSlotDialog({
  open,
  onOpenChange,
  jobName,
  memberName,
  date,
  conflicts,
  onConfirm,
}: TimeSlotDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const validateTimes = () => {
    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return false;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }

    setError('');
    return true;
  };

  const handleConfirm = () => {
    if (validateTimes()) {
      onConfirm(startTime, endTime);
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  const handleCancel = () => {
    setStartTime('09:00');
    setEndTime('17:00');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Time Slot</DialogTitle>
          <DialogDescription>
            Assign specific time for <strong>{jobName}</strong>
            {memberName && <> to <strong>{memberName}</strong></>} on {date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Scheduling Conflicts Detected:</strong>
                <ul className="mt-2 space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index} className="text-sm">
                      • {conflict.job} ({conflict.time})
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">
                  This job will overlap with existing assignments. Consider adjusting the time or reassigning other jobs.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDuration(startTime, endTime)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                {conflicts.length > 0 ? 'Assign Anyway' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return '0 hours';
  
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const diffMinutes = endMinutes - startMinutes;
  
  if (diffMinutes <= 0) return '0 hours';
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours}h ${minutes}m`;
}
