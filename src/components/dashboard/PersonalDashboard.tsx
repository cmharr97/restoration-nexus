import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Briefcase, Calendar, AlertCircle, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export function PersonalDashboard() {
  const { user } = useAuth();
  const { organization, membership } = useOrganization();
  const [profile, setProfile] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, organization]);

  const fetchDashboardData = async () => {
    if (!user || !organization) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Fetch today's schedule
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: scheduleData } = await (supabase
        .from('user_schedules' as any)
        .select(`
          *,
          assignments:schedule_assignments (
            *,
            projects:project_id (
              id,
              name,
              job_type,
              address,
              priority
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('date', today) as any);

      setTodaySchedule((scheduleData as any) || []);

      // Fetch assigned jobs
      const { data: jobsData } = await (supabase
        .from('projects' as any)
        .select('*')
        .eq('assigned_to', user.id)
        .eq('organization_id', organization.id)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .limit(5) as any);

      setAssignedJobs((jobsData as any) || []);

      // Mock notifications (replace with real notification system later)
      setNotifications([
        { id: 1, type: 'task', message: 'Update job photos for Water Damage - 123 Main St', priority: 'high' },
        { id: 2, type: 'schedule', message: 'New job assigned for tomorrow', priority: 'medium' },
        { id: 3, type: 'update', message: 'Equipment check-in reminder', priority: 'low' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'there';
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mitigation: 'bg-blue-500/10 text-blue-500',
      contents: 'bg-purple-500/10 text-purple-500',
      reconstruction: 'bg-green-500/10 text-green-500',
    };
    return colors[type] || colors.mitigation;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/10 text-red-500',
      high: 'bg-orange-500/10 text-orange-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      low: 'bg-gray-500/10 text-gray-500',
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return <div className="text-center py-12">Loading your dashboard...</div>;
  }

  // Role-based dashboard content
  const isFieldWorker = membership?.role && ['coordinator', 'technician'].includes(membership.role);
  const isManager = membership?.role && ['pm', 'admin', 'owner', 'executive'].includes(membership.role);

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-2">
          {getGreeting()}, {getUserName()}!
        </h1>
        <p className="text-muted-foreground text-lg">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Jobs</p>
                <p className="text-3xl font-bold font-headline">
                  {todaySchedule.flatMap(s => s.assignments || []).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold font-headline">{assignedJobs.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifications</p>
                <p className="text-3xl font-bold font-headline">{notifications.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySchedule.length === 0 || todaySchedule.every(s => !s.assignments || s.assignments.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No jobs scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.flatMap((schedule: any) => 
                (schedule.assignments || []).map((assignment: any) => (
                  <Link
                    key={assignment.id}
                    to={`/projects/${assignment.project_id}`}
                    className="block p-4 rounded-lg border hover:border-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{assignment.projects?.name}</h4>
                          <Badge className={getJobTypeColor(assignment.projects?.job_type)}>
                            {assignment.projects?.job_type}
                          </Badge>
                          {assignment.projects?.priority && (
                            <Badge className={getPriorityColor(assignment.projects?.priority)}>
                              {assignment.projects?.priority}
                            </Badge>
                          )}
                        </div>
                        {assignment.projects?.address && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {assignment.projects.address}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {assignment.start_time?.substring(0, 5)} - {assignment.end_time?.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Active Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              My Active Jobs
            </CardTitle>
            <Link to="/projects">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {assignedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active jobs assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedJobs.map((job: any) => (
                <Link
                  key={job.id}
                  to={`/projects/${job.id}`}
                  className="block p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{job.name}</h4>
                        <Badge className={getJobTypeColor(job.job_type)}>
                          {job.job_type}
                        </Badge>
                      </div>
                      {job.address && (
                        <p className="text-sm text-muted-foreground">{job.address}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications & Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Notifications & Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50 text-success" />
              <p>All caught up! No pending notifications.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    notification.priority === 'high' 
                      ? 'bg-red-500/10' 
                      : notification.priority === 'medium'
                      ? 'bg-yellow-500/10'
                      : 'bg-blue-500/10'
                  }`}
                >
                  <AlertCircle className={`h-4 w-4 mt-0.5 ${
                    notification.priority === 'high'
                      ? 'text-red-500'
                      : notification.priority === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {notification.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager-specific section */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                View team schedules, workload analytics, and project assignments
              </p>
              <div className="flex gap-2">
                <Link to="/schedule">
                  <Button variant="outline" size="sm">Schedule</Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" size="sm">Analytics</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
