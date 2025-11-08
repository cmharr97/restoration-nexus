import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function FieldCrewDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();

  const myJobs = projects.filter(p => p.assigned_to === user?.id);
  const todayJobs = myJobs.filter(p => p.status === 'active');

  const kpis = [
    {
      title: "Today's Jobs",
      value: todayJobs.length,
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      title: "My Hours",
      value: "0",
      icon: Clock,
      color: "text-green-500"
    },
    {
      title: "Check-Ins Due",
      value: "0",
      icon: CheckCircle,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Field Crew Dashboard</h2>
        <p className="text-muted-foreground">Today's schedule and task assignments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-20 bg-accent hover:bg-accent/90">
            <Clock className="mr-2 h-5 w-5" />
            Clock In/Out
          </Button>
          <Button className="h-20" variant="outline">
            <MapPin className="mr-2 h-5 w-5" />
            View Directions
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/check-ins">Log Blocker</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todayJobs.length > 0 ? (
            <div className="space-y-4">
              {todayJobs.map(job => (
                <div 
                  key={job.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{job.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {job.address}
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/projects/${job.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No jobs scheduled for today
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
