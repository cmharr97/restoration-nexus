import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, QrCode, DollarSign, Archive } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ContentsSpecialistDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();

  const myPackJobs = projects.filter(p => 
    p.assigned_to === user?.id && p.job_type === 'contents'
  );

  const kpis = [
    {
      title: "My Pack Jobs",
      value: myPackJobs.length,
      icon: Package,
      color: "text-teal-500"
    },
    {
      title: "Items in Storage",
      value: "0",
      icon: Archive,
      color: "text-blue-500"
    },
    {
      title: "Value at Risk",
      value: "$0",
      icon: DollarSign,
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contents Specialist Dashboard</h2>
        <p className="text-muted-foreground">Inventory management and pack/return tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-l-4 border-l-teal-500">
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
            <QrCode className="mr-2 h-5 w-5" />
            Scan Items
          </Button>
          <Button className="h-20" variant="outline">
            Update Conditions
          </Button>
          <Button className="h-20" variant="outline">
            Return Goods
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Pack Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {myPackJobs.length > 0 ? (
            <div className="space-y-4">
              {myPackJobs.map(job => (
                <Link 
                  key={job.id} 
                  to={`/projects/${job.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-sm text-muted-foreground">{job.address}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pack jobs assigned
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-accent" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No items in storage
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
