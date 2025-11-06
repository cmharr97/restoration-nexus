import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Calendar, Plus, UserPlus, ArrowRightLeft, Loader2, Clock, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarView } from '@/components/schedule/CalendarView';

export default function JobsSchedule() {
  return (
    <ProtectedRoute requireOrganization>
      <JobsScheduleContent />
    </ProtectedRoute>
  );
}

function JobsScheduleContent() {
  const { organization, hasRole } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [jobs, setJobs] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const canManageJobs = hasRole(['owner', 'admin', 'pm', 'executive']);
  const canManageSchedules = hasRole(['owner', 'admin', 'pm', 'executive']);

  useEffect(() => {
    fetchAllData();
  }, [organization]);

  const fetchAllData = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchJobs(),
        fetchSchedules(),
        fetchMembers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('projects' as any)
        .select(`
          *,
          assigned_profile:assigned_to (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchSchedules = async () => {
    if (!organization) return;

    try {
      const { data, error } = await (supabase
        .from('user_schedules' as any)
        .select(`
          *,
          assignments:schedule_assignments (
            *,
            projects:project_id (
              id,
              name,
              job_type
            )
          )
        `)
        .eq('organization_id', organization.id) as any);

      if (error) throw error;
      setSchedules((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await (supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false }) as any);

      if (error) throw error;
      setMembers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleJobDrop = async (jobId: string, date: string, userId?: string) => {
    if (!organization || !user) return;

    try {
      // If userId is provided, ensure schedule exists for that user on that date
      if (userId) {
        // Check if schedule exists
        let { data: schedule, error: scheduleError } = await (supabase
          .from('user_schedules' as any)
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .maybeSingle() as any);

        // Create schedule if it doesn't exist
        if (!schedule) {
          const { data: newSchedule, error: createError } = await (supabase
            .from('user_schedules' as any)
            .insert({
              user_id: userId,
              organization_id: organization.id,
              date: date,
              is_available: true,
            })
            .select()
            .single() as any);

          if (createError) throw createError;
          schedule = newSchedule;
        }

        // Create schedule assignment
        const { error: assignError } = await (supabase
          .from('schedule_assignments' as any)
          .insert({
            schedule_id: schedule.id,
            project_id: jobId,
            start_time: '09:00:00',
            end_time: '17:00:00',
            created_by: user.id,
          }) as any);

        if (assignError) throw assignError;

        toast({
          title: 'Job Assigned',
          description: 'Job has been added to the schedule',
        });
      }

      await fetchSchedules();
    } catch (error: any) {
      console.error('Error assigning job:', error);
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline mb-2">Jobs & Schedules</h1>
            <p className="text-muted-foreground text-lg">
              Manage job assignments and team schedules
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="jobs" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="schedules" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar">
                <CalendarView
                  jobs={jobs}
                  schedules={schedules}
                  members={members}
                  onJobDrop={handleJobDrop}
                />
              </TabsContent>

              <TabsContent value="jobs">
                <JobsManagement 
                  canManage={canManageJobs}
                  onJobsChange={fetchJobs}
                />
              </TabsContent>

              <TabsContent value="schedules">
                <SchedulesManagement 
                  canManage={canManageSchedules}
                  onSchedulesChange={fetchSchedules}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}

function JobsManagement({ canManage, onJobsChange }: { canManage: boolean; onJobsChange?: () => void }) {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    job_type: 'mitigation',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
  });

  useEffect(() => {
    fetchJobs();
    fetchMembers();
  }, [organization]);

  const fetchJobs = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('projects' as any)
        .select(`
          *,
          assigned_profile:assigned_to (
            id,
            full_name,
            email,
            avatar_url
          ),
          creator:created_by (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!organization || !user || !formData.name || !formData.job_type) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('projects' as any)
        .insert({
          organization_id: organization.id,
          name: formData.name,
          description: formData.description || null,
          address: formData.address || null,
          job_type: formData.job_type,
          status: formData.status,
          priority: formData.priority,
          assigned_to: formData.assigned_to || null,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Job Created',
        description: 'New job has been created successfully',
      });

      await fetchJobs();
      onJobsChange?.();
      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        address: '',
        job_type: 'mitigation',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAssignJob = async (jobId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('projects' as any)
        .update({ assigned_to: userId || null })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Job Assigned',
        description: 'Job has been reassigned successfully',
      });

      await fetchJobs();
      onJobsChange?.();
      setShowAssignDialog(false);
      setSelectedJob(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mitigation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      contents: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      reconstruction: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colors[type] || colors.mitigation;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      in_progress: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-green-500/10 text-green-500',
      on_hold: 'bg-gray-500/10 text-gray-500',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-headline">All Jobs</h2>
          <p className="text-muted-foreground">Manage and assign jobs to team members</p>
        </div>
        {canManage && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>Add a new job to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Job Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Water Damage Mitigation"
                  />
                </div>
                
                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mitigation">Mitigation</SelectItem>
                      <SelectItem value="contents">Contents</SelectItem>
                      <SelectItem value="reconstruction">Reconstruction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Job site address"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Job details and requirements"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {members.map((member: any) => (
                        <SelectItem key={member.id} value={member.profiles.id}>
                          {member.profiles.full_name || member.profiles.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateJob}
                  disabled={creating || !formData.name}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Job'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No jobs yet. {canManage && 'Create your first job to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{job.name}</h3>
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      {job.priority === 'urgent' && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    
                    {job.address && (
                      <p className="text-sm text-muted-foreground mb-2">{job.address}</p>
                    )}
                    
                    {job.description && (
                      <p className="text-sm mb-3">{job.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {format(new Date(job.created_at), 'MMM d, yyyy')}</span>
                      {job.creator && (
                        <span>by {job.creator.full_name || job.creator.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {job.assigned_profile ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={job.assigned_profile.avatar_url || ''} />
                          <AvatarFallback>
                            {(job.assigned_profile.full_name || job.assigned_profile.email)[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {job.assigned_profile.full_name || job.assigned_profile.email}
                          </p>
                          <p className="text-xs text-muted-foreground">Assigned</p>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}

                    {canManage && (
                      <Dialog
                        open={showAssignDialog && selectedJob?.id === job.id}
                        onOpenChange={(open) => {
                          setShowAssignDialog(open);
                          if (!open) setSelectedJob(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            {job.assigned_to ? 'Reassign' : 'Assign'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Job</DialogTitle>
                            <DialogDescription>
                              Select a team member to assign this job to
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div
                              className="p-3 border rounded-lg cursor-pointer hover:bg-accent/5"
                              onClick={() => handleAssignJob(job.id, '')}
                            >
                              <p className="font-medium">Unassign</p>
                              <p className="text-sm text-muted-foreground">Remove current assignment</p>
                            </div>
                            {members.map((member: any) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/5"
                                onClick={() => handleAssignJob(job.id, member.profiles.id)}
                              >
                                <Avatar>
                                  <AvatarImage src={member.profiles.avatar_url || ''} />
                                  <AvatarFallback>
                                    {(member.profiles.full_name || member.profiles.email)[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {member.profiles.full_name || member.profiles.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SchedulesManagement({ canManage, onSchedulesChange }: { canManage: boolean; onSchedulesChange?: () => void }) {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [schedule, setSchedule] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [organization]);

  useEffect(() => {
    if (selectedMember && selectedDate) {
      fetchSchedule();
    }
  }, [selectedMember, selectedDate]);

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await (supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true) as any);

      if (error) throw error;
      setMembers((data as any) || []);
      
      // Auto-select current user if they're a member
      if (user && !canManage) {
        const currentMember = (data as any)?.find((m: any) => m.user_id === user.id);
        if (currentMember) {
          setSelectedMember(currentMember.profiles.id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchSchedule = async () => {
    if (!selectedMember || !selectedDate) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('user_schedules' as any)
        .select('*')
        .eq('user_id', selectedMember)
        .eq('date', selectedDate)
        .single() as any);

      if (error && error.code !== 'PGRST116') throw error;
      setSchedule((data as any) || null);

      if (data) {
        const { data: assignData, error: assignError } = await (supabase
          .from('schedule_assignments' as any)
          .select(`
            *,
            projects:project_id (
              id,
              name,
              job_type,
              address
            )
          `)
          .eq('schedule_id', (data as any).id) as any);

        if (assignError) throw assignError;
        setAssignments((assignData as any) || []);
      } else {
        setAssignments([]);
      }
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Team Schedules</CardTitle>
          <CardDescription>
            View and manage team member schedules and job assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="member">Team Member</Label>
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
                disabled={!canManage && !!selectedMember}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member: any) => (
                    <SelectItem key={member.id} value={member.profiles.id}>
                      {member.profiles.full_name || member.profiles.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : selectedMember && selectedDate ? (
            <div className="space-y-4 pt-4">
              {schedule ? (
                <div className="p-4 border rounded-lg bg-accent/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Schedule Details</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Time</p>
                      <p className="font-medium">{schedule.start_time || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Time</p>
                      <p className="font-medium">{schedule.end_time || 'Not set'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={schedule.is_available ? 'default' : 'secondary'}>
                        {schedule.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    {schedule.notes && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="font-medium">{schedule.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No schedule found for this date
                </p>
              )}

              {assignments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Job Assignments</h3>
                  <div className="space-y-2">
                    {assignments.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className="p-3 border rounded-lg hover:bg-accent/5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{assignment.projects.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.start_time} - {assignment.end_time}
                            </p>
                            {assignment.projects.address && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.projects.address}
                              </p>
                            )}
                          </div>
                          <Badge>{assignment.projects.job_type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Select a team member and date to view schedule
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
