import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, CheckCircle, Clock } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ReconTechDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();

  const myReconJobs = projects.filter(p => 
    p.assigned_to === user?.id && p.job_type === 'recon'
  );

  const kpis = [
    {
      title: "My Recon Jobs",
      value: myReconJobs.length,
      icon: CheckCircle,
      color: "text-blue-500"
    },
    {
      title: "Avg Recon Time",
      value: "N/A",
      icon: Clock,
      color: "text-green-500"
    },
    {
      title: "Photos Uploaded",
      value: "0",
      icon: Camera,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Recon Tech Dashboard</h2>
        <p className="text-muted-foreground">My reconnaissance tasks and field intel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-l-4 border-l-blue-500">
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

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-20 bg-accent hover:bg-accent/90">
            <Camera className="mr-2 h-5 w-5" />
            Start Recon
          </Button>
          <Button className="h-20" variant="outline">
            <MapPin className="mr-2 h-5 w-5" />
            View Map
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/check-ins">Check In</Link>
          </Button>
        </div>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Recon Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {myReconJobs.length > 0 ? (
            <div className="space-y-4">
              {myReconJobs.map(job => (
                <Link 
                  key={job.id} 
                  to={`/projects/${job.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-sm text-muted-foreground">{job.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: {job.status}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recon jobs assigned. Check back soon!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Map Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Nearby Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Enable location services to see nearby jobs
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
