import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectBudgetTrackerProps {
  estimatedCost: number | null;
  actualCost: number | null;
}

export default function ProjectBudgetTracker({ estimatedCost, actualCost }: ProjectBudgetTrackerProps) {
  const estimated = estimatedCost || 0;
  const actual = actualCost || 0;
  const difference = estimated - actual;
  const percentageUsed = estimated > 0 ? (actual / estimated) * 100 : 0;
  const isOverBudget = actual > estimated && estimated > 0;
  const isNearBudget = percentageUsed >= 80 && percentageUsed < 100;

  const getBudgetStatus = () => {
    if (isOverBudget) return { label: 'Over Budget', variant: 'destructive' as const, icon: AlertCircle };
    if (isNearBudget) return { label: 'Near Budget', variant: 'default' as const, icon: TrendingUp };
    return { label: 'On Track', variant: 'default' as const, icon: TrendingDown };
  };

  const status = getBudgetStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Tracker
          </span>
          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </CardTitle>
        <CardDescription>Track project costs against budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget Used</span>
            <span className="font-medium">
              {percentageUsed > 0 ? percentageUsed.toFixed(1) : 0}%
            </span>
          </div>
          <Progress 
            value={Math.min(percentageUsed, 100)} 
            className={cn(
              "h-3",
              isOverBudget && "bg-destructive/20"
            )}
          />
        </div>

        {/* Cost Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Estimated Cost</p>
            <p className="text-2xl font-bold">
              ${estimated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Actual Cost</p>
            <p className="text-2xl font-bold">
              ${actual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isOverBudget ? 'Over by' : 'Remaining'}
            </p>
            <p className={cn(
              "text-2xl font-bold",
              isOverBudget ? "text-destructive" : "text-success"
            )}>
              {isOverBudget ? '-' : '+'}
              ${Math.abs(difference).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Visual Indicator */}
        <div className={cn(
          "p-4 rounded-lg border",
          isOverBudget ? "bg-destructive/10 border-destructive/20" : 
          isNearBudget ? "bg-yellow-500/10 border-yellow-500/20" : 
          "bg-success/10 border-success/20"
        )}>
          <div className="flex items-start gap-3">
            <StatusIcon className={cn(
              "h-5 w-5 mt-0.5",
              isOverBudget ? "text-destructive" :
              isNearBudget ? "text-yellow-600" :
              "text-success"
            )} />
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isOverBudget ? 'Budget Exceeded' : 
                 isNearBudget ? 'Approaching Budget Limit' : 
                 'Budget On Track'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isOverBudget ? 
                  'Project costs have exceeded the estimated budget. Review expenses and adjust accordingly.' :
                 isNearBudget ? 
                  'Project is nearing budget limit. Monitor remaining costs carefully.' :
                  'Project costs are within budget. Continue monitoring expenses.'}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Efficiency */}
        {estimated > 0 && actual > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost Efficiency</span>
              <span className={cn(
                "font-medium",
                isOverBudget ? "text-destructive" : "text-success"
              )}>
                {isOverBudget ? '+' : '-'}
                {Math.abs((actual - estimated) / estimated * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
