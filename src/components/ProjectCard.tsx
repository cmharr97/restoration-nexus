import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Users, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  claimNumber: string;
  lossType: string;
  stage: string;
  status: "active" | "delayed" | "completed";
  address: string;
  progress: number;
  budget: string;
  manager: string;
  dueDate: string;
}

export default function ProjectCard({
  title,
  claimNumber,
  lossType,
  stage,
  status,
  address,
  progress,
  budget,
  manager,
  dueDate,
}: ProjectCardProps) {
  const statusColors = {
    active: "bg-success text-success-foreground",
    delayed: "bg-warning text-warning-foreground",
    completed: "bg-info text-info-foreground",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-headline mb-1">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">Claim #{claimNumber}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="font-medium">
            {lossType}
          </Badge>
          <Badge className={cn("font-medium", statusColors[status])}>
            {status.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="font-medium">
            {stage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due: {dueDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{budget}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{manager}</span>
          </div>
        </div>

        <Button className="w-full bg-accent hover:bg-accent/90" size="sm">
          View Project
        </Button>
      </CardContent>
    </Card>
  );
}
