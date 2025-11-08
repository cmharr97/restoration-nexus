import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, AlertTriangle, Building, Target } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function OwnerDashboard() {
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalRevenue = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const profitMargin = 0; // Calculate from financials
  const arDays = 0; // Calculate from invoices

  const kpis = [
    {
      title: "Active Projects",
      value: activeProjects,
      icon: Building,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pipeline Revenue",
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Profit Margin",
      value: "N/A",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Crew Utilization",
      value: "0%",
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "AR Days",
      value: "N/A",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Lead Conversion",
      value: "0%",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Owner Dashboard</h2>
        <p className="text-muted-foreground">High-level KPIs and business insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Button asChild className="h-20 bg-accent hover:bg-accent/90">
            <Link to="/leads">New Lead</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/projects">View Projects</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/analytics">View Analytics</Link>
          </Button>
          <Button asChild className="h-20" variant="outline">
            <Link to="/financials">Financials</Link>
          </Button>
        </div>
      </div>

      {/* Profit Leaks Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Profit Leaks & Change Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No change orders pending review
          </div>
        </CardContent>
      </Card>

      {/* Team Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Team Health & Check-Ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            All team members are active and healthy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
