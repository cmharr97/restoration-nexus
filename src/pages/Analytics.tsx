import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInHours, parseISO } from 'date-fns';

export default function Analytics() {
  return (
    <ProtectedRoute requireOrganization>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const { organization } = useOrganization();
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      fetchAnalytics();
    }
  }, [organization, timeRange]);

  const getDateRange = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case 'all':
        return {
          start: new Date(2020, 0, 1),
          end: now,
        };
      default:
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
    }
  };

  const fetchAnalytics = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      // Fetch schedules and assignments
      const { data: schedules, error: schedulesError } = await (supabase
        .from('user_schedules' as any)
        .select(`
          *,
          assignments:schedule_assignments (
            *,
            projects:project_id (
              id,
              name,
              job_type,
              priority
            )
          ),
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .gte('date', startDate)
        .lte('date', endDate) as any);

      if (schedulesError) throw schedulesError;

      // Fetch organization members
      const { data: members, error: membersError } = await (supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true) as any);

      if (membersError) throw membersError;

      // Calculate analytics
      const memberStats = calculateMemberStats(schedules, members);
      const overallStats = calculateOverallStats(schedules);
      const jobTypeDistribution = calculateJobTypeDistribution(schedules);
      const efficiencyMetrics = calculateEfficiencyMetrics(schedules, members);

      setAnalytics({
        memberStats,
        overallStats,
        jobTypeDistribution,
        efficiencyMetrics,
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMemberStats = (schedules: any[], members: any[]) => {
    const stats = members.map((member: any) => {
      const memberSchedules = schedules.filter((s: any) => s.user_id === member.profiles.id);
      const totalAssignments = memberSchedules.reduce(
        (sum: number, s: any) => sum + (s.assignments?.length || 0),
        0
      );

      let totalHours = 0;
      let overtimeHours = 0;

      memberSchedules.forEach((schedule: any) => {
        if (schedule.start_time && schedule.end_time) {
          const startTime = parseISO(`1970-01-01T${schedule.start_time}`);
          const endTime = parseISO(`1970-01-01T${schedule.end_time}`);
          const hours = differenceInHours(endTime, startTime);
          
          totalHours += hours;
          if (hours > 8) {
            overtimeHours += hours - 8;
          }
        }

        schedule.assignments?.forEach((assignment: any) => {
          if (assignment.start_time && assignment.end_time) {
            const startTime = parseISO(`1970-01-01T${assignment.start_time}`);
            const endTime = parseISO(`1970-01-01T${assignment.end_time}`);
            totalHours += differenceInHours(endTime, startTime);
          }
        });
      });

      const utilizationRate = memberSchedules.length > 0
        ? (totalAssignments / (memberSchedules.length * 3)) * 100
        : 0;

      return {
        id: member.profiles.id,
        name: member.profiles.full_name || member.profiles.email,
        email: member.profiles.email,
        avatar: member.profiles.avatar_url,
        role: member.role,
        scheduledDays: memberSchedules.length,
        totalAssignments,
        totalHours: Math.round(totalHours),
        overtimeHours: Math.round(overtimeHours),
        utilizationRate: Math.round(utilizationRate),
      };
    });

    return stats.sort((a: any, b: any) => b.totalHours - a.totalHours);
  };

  const calculateOverallStats = (schedules: any[]) => {
    const totalSchedules = schedules.length;
    const totalAssignments = schedules.reduce(
      (sum: number, s: any) => sum + (s.assignments?.length || 0),
      0
    );

    let totalHours = 0;
    let overtimeTotal = 0;

    schedules.forEach((schedule: any) => {
      if (schedule.start_time && schedule.end_time) {
        const startTime = parseISO(`1970-01-01T${schedule.start_time}`);
        const endTime = parseISO(`1970-01-01T${schedule.end_time}`);
        const hours = differenceInHours(endTime, startTime);
        
        totalHours += hours;
        if (hours > 8) {
          overtimeTotal += hours - 8;
        }
      }

      schedule.assignments?.forEach((assignment: any) => {
        if (assignment.start_time && assignment.end_time) {
          const startTime = parseISO(`1970-01-01T${assignment.start_time}`);
          const endTime = parseISO(`1970-01-01T${assignment.end_time}`);
          totalHours += differenceInHours(endTime, startTime);
        }
      });
    });

    return {
      totalSchedules,
      totalAssignments,
      totalHours: Math.round(totalHours),
      overtimeHours: Math.round(overtimeTotal),
      avgUtilization: schedules.length > 0
        ? Math.round((totalAssignments / (totalSchedules * 3)) * 100)
        : 0,
    };
  };

  const calculateJobTypeDistribution = (schedules: any[]) => {
    const distribution: Record<string, number> = {
      mitigation: 0,
      contents: 0,
      reconstruction: 0,
    };

    schedules.forEach((schedule: any) => {
      schedule.assignments?.forEach((assignment: any) => {
        if (assignment.projects?.job_type) {
          distribution[assignment.projects.job_type]++;
        }
      });
    });

    return distribution;
  };

  const calculateEfficiencyMetrics = (schedules: any[], members: any[]) => {
    const activeMembers = members.length;
    const scheduledMembers = new Set(schedules.map((s: any) => s.user_id)).size;
    const scheduleComplianceRate = activeMembers > 0
      ? Math.round((scheduledMembers / activeMembers) * 100)
      : 0;

    const schedulesWithConflicts = schedules.filter((schedule: any) => {
      const assignments = schedule.assignments || [];
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const a1 = assignments[i];
          const a2 = assignments[j];
          
          if (a1.start_time && a1.end_time && a2.start_time && a2.end_time) {
            const start1 = parseISO(`1970-01-01T${a1.start_time}`);
            const end1 = parseISO(`1970-01-01T${a1.end_time}`);
            const start2 = parseISO(`1970-01-01T${a2.start_time}`);
            const end2 = parseISO(`1970-01-01T${a2.end_time}`);

            if (
              (start1 >= start2 && start1 < end2) ||
              (end1 > start2 && end1 <= end2) ||
              (start1 <= start2 && end1 >= end2)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    }).length;

    const conflictRate = schedules.length > 0
      ? Math.round((schedulesWithConflicts / schedules.length) * 100)
      : 0;

    return {
      scheduleComplianceRate,
      conflictRate,
      schedulingEfficiency: Math.max(0, 100 - conflictRate),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2">Workload Analytics</h1>
              <p className="text-muted-foreground text-lg">
                Team utilization, overtime tracking, and efficiency metrics
              </p>
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="text-3xl font-bold">
                    {analytics?.overallStats.totalHours || 0}
                  </span>
                </div>
                {analytics?.overallStats.overtimeHours > 0 && (
                  <p className="text-sm text-orange-500 mt-1">
                    +{analytics.overallStats.overtimeHours} overtime
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <span className="text-3xl font-bold">
                    {analytics?.overallStats.totalAssignments || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Across {analytics?.overallStats.totalSchedules || 0} schedules
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <span className="text-3xl font-bold">
                    {analytics?.overallStats.avgUtilization || 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics?.overallStats.avgUtilization || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Scheduling Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-3xl font-bold">
                    {analytics?.efficiencyMetrics.schedulingEfficiency || 0}%
                  </span>
                </div>
                {analytics?.efficiencyMetrics.conflictRate > 0 && (
                  <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {analytics.efficiencyMetrics.conflictRate}% conflicts
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Job Type Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Type Distribution</CardTitle>
              <CardDescription>Breakdown of jobs by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {analytics?.jobTypeDistribution.mitigation || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Mitigation</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">
                    {analytics?.jobTypeDistribution.contents || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Contents</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {analytics?.jobTypeDistribution.reconstruction || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Reconstruction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Member Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual workload and utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.memberStats.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || ''} />
                      <AvatarFallback>
                        {member.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Hours</p>
                          <p className="font-medium">
                            {member.totalHours}h
                            {member.overtimeHours > 0 && (
                              <span className="text-orange-500 ml-1">
                                (+{member.overtimeHours})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Jobs</p>
                          <p className="font-medium">{member.totalAssignments}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Scheduled</p>
                          <p className="font-medium">{member.scheduledDays}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <div className="flex items-center gap-2">
                            <Progress value={member.utilizationRate} className="flex-1" />
                            <span className="font-medium">{member.utilizationRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!analytics?.memberStats || analytics.memberStats.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available for selected time range
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
