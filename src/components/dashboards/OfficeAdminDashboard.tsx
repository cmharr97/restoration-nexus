import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function OfficeAdminDashboard() {
  const kpis = [
    {
      title: "Pending Approvals",
      value: "0",
      icon: FileCheck,
      color: "text-orange-500"
    },
    {
      title: "Overdue Tasks",
      value: "0",
      icon: TrendingUp,
      color: "text-red-500"
    },
    {
      title: "Equipment Utilization",
      value: "0%",
      icon: Settings,
      color: "text-blue-500"
    },
    {
      title: "User Onboards",
      value: "0 Pending",
      icon: Users,
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Office Admin Dashboard</h2>
        <p className="text-muted-foreground">Workflow orchestration and administrative tasks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-l-4 border-l-accent">
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
        <div className="grid gap-4 md:grid-cols-4">
          <Button asChild className="h-20 bg-accent hover:bg-accent/90">
            <Link to="/settings">Manage Users</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/analytics">Generate Reports</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/schedule">Manage Equipment</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/boards">View Workflows</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No pending admin tasks
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
