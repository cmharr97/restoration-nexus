import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Droplet,
  Flame,
  Wind,
  Building2,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  DollarSign,
  Sparkles,
  Info,
} from "lucide-react";

export default function Index() {
  const { organization, membership } = useOrganization();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:ml-64 mt-16 p-6">
        {/* Welcome Alert */}
        {organization && (
          <Alert className="mb-6 border-accent/50 bg-accent/5">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription>
              Welcome to <strong>{organization.name}</strong>! You're logged in as{' '}
              <strong className="capitalize">{membership?.role.replace(/_/g, ' ')}</strong>.
            </AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2">Executive Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Real-time overview of operations, projects, and equipment
              </p>
            </div>
            <Link to="/scope-generator">
              <Button className="bg-accent hover:bg-accent/90 gap-2">
                <Sparkles className="h-5 w-5" />
                AI Scope Generator
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Projects"
            value="24"
            change="+3 this week"
            changeType="positive"
            icon={Building2}
            iconColor="text-accent"
          />
          <MetricCard
            title="Pipeline Value"
            value="$2.4M"
            change="+12% this month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-success"
          />
          <MetricCard
            title="Equipment Deployed"
            value="142"
            change="89% utilization"
            changeType="positive"
            icon={Wrench}
            iconColor="text-info"
          />
          <MetricCard
            title="Avg Response Time"
            value="2.3h"
            change="-15 min vs last month"
            changeType="positive"
            icon={Clock}
            iconColor="text-warning"
          />
        </div>

        {/* Projects by Stage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-headline">Projects by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-3xl font-bold font-headline text-accent mb-1">8</div>
                <div className="text-sm text-muted-foreground">Emergency</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-3xl font-bold font-headline text-info mb-1">6</div>
                <div className="text-sm text-muted-foreground">Mitigation</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-3xl font-bold font-headline text-warning mb-1">4</div>
                <div className="text-sm text-muted-foreground">Estimating</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-3xl font-bold font-headline text-success mb-1">5</div>
                <div className="text-sm text-muted-foreground">Reconstruction</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-3xl font-bold font-headline mb-1">1</div>
                <div className="text-sm text-muted-foreground">Closeout</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-headline">Active Projects</h2>
            <Button variant="outline">View All Projects</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard
              title="Residential Water Loss"
              claimNumber="2024-WL-001"
              lossType="Water"
              stage="Mitigation"
              status="active"
              address="1234 Oak Street, Austin, TX"
              progress={45}
              budget="$48,500"
              manager="John Smith"
              dueDate="Dec 15, 2024"
            />
            <ProjectCard
              title="Commercial Fire Damage"
              claimNumber="2024-FD-032"
              lossType="Fire"
              stage="Reconstruction"
              status="active"
              address="567 Industrial Blvd, Houston, TX"
              progress={68}
              budget="$185,000"
              manager="Sarah Johnson"
              dueDate="Jan 30, 2025"
            />
            <ProjectCard
              title="Multi-Unit Storm Damage"
              claimNumber="2024-SD-018"
              lossType="Storm"
              stage="Estimating"
              status="delayed"
              address="890 Complex Drive, Dallas, TX"
              progress={22}
              budget="$320,000"
              manager="Mike Davis"
              dueDate="Dec 10, 2024"
            />
          </div>
        </div>

        {/* Alerts & Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Active Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Claim #2024-WL-045 - No update in 72h</p>
                  <p className="text-xs text-muted-foreground">SLA breach warning</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                <Clock className="h-4 w-4 text-warning mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Equipment due for maintenance</p>
                  <p className="text-xs text-muted-foreground">12 units need service</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              </div>
              <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-warning mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Budget overrun on #2024-FD-032</p>
                  <p className="text-xs text-muted-foreground">15% over forecast</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Recent Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Claim approved by Adjuster</p>
                  <p className="text-xs text-muted-foreground">#2024-WL-038 - $125,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Project completed ahead of schedule</p>
                  <p className="text-xs text-muted-foreground">#2024-SD-015 - 3 days early</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">New lead converted</p>
                  <p className="text-xs text-muted-foreground">Commercial client - $450k opportunity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
