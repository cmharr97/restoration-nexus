import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Flame } from 'lucide-react';

export function CalendarLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Legend</CardTitle>
        <CardDescription>Job types and priorities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Job Types</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              Mitigation
            </Badge>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              Contents
            </Badge>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              Reconstruction
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Priorities</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-destructive" />
              <Badge variant="destructive">Urgent</Badge>
              <span className="text-xs text-muted-foreground">- Red border</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Badge className="bg-orange-500/10 text-orange-500">High</Badge>
              <span className="text-xs text-muted-foreground">- Orange accent</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">Medium/Low</Badge>
              <span className="text-xs text-muted-foreground">- Standard styling</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Status Indicators</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-accent"></div>
              <span>Drop zone active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
