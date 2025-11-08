import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Gauge, Clock, AlertTriangle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function MitigationTechDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();

  const myDryingJobs = projects.filter(p => 
    p.assigned_to === user?.id && p.job_type === 'mitigation'
  );

  const kpis = [
    {
      title: "My Drying Jobs",
      value: myDryingJobs.length,
      icon: Droplets,
      color: "text-blue-500"
    },
    {
      title: "RH Compliance",
      value: "100%",
      icon: Gauge,
      color: "text-green-500"
    },
    {
      title: "Equipment Assigned",
      value: "0",
      icon: Clock,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mitigation Tech Dashboard</h2>
        <p className="text-muted-foreground">Drying operations and equipment management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-l-4 border-l-purple-500">
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
            <Gauge className="mr-2 h-5 w-5" />
            Log Readings
          </Button>
          <Button className="h-20" variant="outline">
            Dispatch Gear
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/team-chat">Team Chat</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Drying Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {myDryingJobs.length > 0 ? (
            <div className="space-y-4">
              {myDryingJobs.map(job => (
                <Link 
                  key={job.id} 
                  to={`/projects/${job.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-sm text-muted-foreground">{job.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: {job.status} | Priority: {job.priority}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No drying jobs assigned
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Equipment & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            All equipment operational
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
