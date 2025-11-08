import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, PlayCircle, StopCircle, DollarSign } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { formatDistanceToNow } from 'date-fns';

interface TimeTrackerProps {
  projectId: string;
  organizationId: string;
}

export default function TimeTracker({ projectId, organizationId }: TimeTrackerProps) {
  const { entries, activeEntry, loading, clockIn, clockOut } = useTimeEntries(projectId);
  const [hourlyRate, setHourlyRate] = useState('');
  const [notes, setNotes] = useState('');
  const [clockOutNotes, setClockOutNotes] = useState('');

  const handleClockIn = async () => {
    await clockIn(projectId, organizationId, hourlyRate ? parseFloat(hourlyRate) : undefined, notes);
    setHourlyRate('');
    setNotes('');
  };

  const handleClockOut = async () => {
    if (activeEntry) {
      await clockOut(activeEntry.id, clockOutNotes);
      setClockOutNotes('');
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + (entry.billable_hours || 0), 0);
  const totalCost = entries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
        <CardDescription>Track billable hours for this project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Timer */}
        {activeEntry ? (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currently Clocked In</p>
                <p className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(activeEntry.clock_in), { addSuffix: false })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Started {new Date(activeEntry.clock_in).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="default" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clock-out-notes">Notes (Optional)</Label>
              <Textarea
                id="clock-out-notes"
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="Add notes about work completed..."
                rows={2}
              />
            </div>

            <Button onClick={handleClockOut} variant="destructive" className="w-full gap-2">
              <StopCircle className="h-4 w-4" />
              Clock Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="hourly-rate">Hourly Rate (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hourly-rate"
                    type="number"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="clock-in-notes">Notes (Optional)</Label>
              <Textarea
                id="clock-in-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the work you'll be doing..."
                rows={2}
              />
            </div>

            <Button onClick={handleClockIn} className="w-full gap-2" disabled={loading}>
              <PlayCircle className="h-4 w-4" />
              Clock In
            </Button>
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium">Recent Entries</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(entry.clock_in).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.clock_in).toLocaleTimeString()} - 
                      {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : ' In Progress'}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {entry.billable_hours ? `${entry.billable_hours.toFixed(2)}h` : '-'}
                    </p>
                    {entry.total_cost && (
                      <p className="text-xs text-muted-foreground">
                        ${entry.total_cost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
