import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Repeat, Plus, Play, Pause, Trash2, Loader2, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { Link } from 'react-router-dom';

export default function RecurringJobs() {
  return (
    <ProtectedRoute requireOrganization requiredRoles={['owner', 'admin', 'pm', 'executive']}>
      <RecurringJobsContent />
    </ProtectedRoute>
  );
}

function RecurringJobsContent() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    job_type: 'mitigation',
    priority: 'medium',
    recurrence_pattern: 'weekly',
    recurrence_day: 1,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    assigned_to: '',
    start_time: '09:00',
    end_time: '17:00',
    auto_skip_conflicts: true,
  });

  useEffect(() => {
    fetchTemplates();
    fetchMembers();
  }, [organization]);

  const fetchTemplates = async () => {
    if (!organization) return;

    try {
      const { data, error } = await (supabase
        .from('recurring_job_templates' as any)
        .select(`
          *,
          assigned_profile:assigned_to (
            full_name,
            email
          ),
          instances:recurring_job_instances (
            id,
            scheduled_date,
            was_skipped
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
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
            full_name
          )
        `)
        .eq('organization_id', organization.id)
        .eq('is_active', true) as any);

      if (error) throw error;
      setMembers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!organization || !user) return;

    try {
      const { error } = await (supabase
        .from('recurring_job_templates' as any)
        .insert({
          organization_id: organization.id,
          name: formData.name,
          description: formData.description || null,
          address: formData.address || null,
          job_type: formData.job_type,
          priority: formData.priority,
          recurrence_pattern: formData.recurrence_pattern,
          recurrence_day: formData.recurrence_day,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          assigned_to: formData.assigned_to || null,
          start_time: formData.start_time + ':00',
          end_time: formData.end_time + ':00',
          auto_skip_conflicts: formData.auto_skip_conflicts,
          created_by: user.id,
        }) as any);

      if (error) throw error;

      toast({
        title: 'Template Created',
        description: 'Recurring job template has been created',
      });

      await fetchTemplates();
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateJobs = async (templateId: string) => {
    setGenerating(templateId);

    try {
      const template = templates.find((t: any) => t.id === templateId);
      const endDate = template.end_date || format(addMonths(new Date(), 1), 'yyyy-MM-dd');

      const { data, error } = await (supabase.rpc('generate_recurring_jobs', {
        p_template_id: templateId,
        p_start_date: new Date().toISOString().split('T')[0],
        p_end_date: endDate,
      }) as any);

      if (error) throw error;

      const results = data as any[];
      const generated = results.filter((r: any) => !r.was_skipped).length;
      const skipped = results.filter((r: any) => r.was_skipped).length;

      toast({
        title: 'Jobs Generated',
        description: `Created ${generated} jobs${skipped > 0 ? `, skipped ${skipped} due to conflicts` : ''}`,
      });

      await fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleToggleActive = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase
        .from('recurring_job_templates' as any)
        .update({ is_active: !isActive })
        .eq('id', templateId) as any);

      if (error) throw error;

      toast({
        title: isActive ? 'Template Paused' : 'Template Activated',
        description: `Template has been ${isActive ? 'paused' : 'activated'}`,
      });

      await fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This will not delete already generated jobs.')) return;

    try {
      const { error } = await (supabase
        .from('recurring_job_templates' as any)
        .delete()
        .eq('id', templateId) as any);

      if (error) throw error;

      toast({
        title: 'Template Deleted',
        description: 'Recurring job template has been deleted',
      });

      await fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      job_type: 'mitigation',
      priority: 'medium',
      recurrence_pattern: 'weekly',
      recurrence_day: 1,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
      assigned_to: '',
      start_time: '09:00',
      end_time: '17:00',
      auto_skip_conflicts: true,
    });
  };

  const getRecurrenceLabel = (pattern: string, day: number) => {
    if (pattern === 'daily') return 'Every day';
    if (pattern === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Every ${days[day]}`;
    }
    if (pattern === 'biweekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Every other ${days[day]}`;
    }
    if (pattern === 'monthly') return `Day ${day} of each month`;
    return pattern;
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
              <h1 className="text-4xl font-bold font-headline mb-2">Recurring Jobs</h1>
              <p className="text-muted-foreground text-lg">
                Create templates for jobs that repeat automatically
              </p>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Recurring Job Template</DialogTitle>
                  <DialogDescription>
                    Set up a template that will generate jobs automatically
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Job Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Weekly Equipment Check"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      placeholder="Job details"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Recurrence Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pattern">Repeat Pattern *</Label>
                        <Select
                          value={formData.recurrence_pattern}
                          onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(formData.recurrence_pattern === 'weekly' || formData.recurrence_pattern === 'biweekly') && (
                        <div>
                          <Label htmlFor="day">Day of Week</Label>
                          <Select
                            value={formData.recurrence_day.toString()}
                            onValueChange={(value) => setFormData({ ...formData, recurrence_day: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {formData.recurrence_pattern === 'monthly' && (
                        <div>
                          <Label htmlFor="day">Day of Month</Label>
                          <Input
                            id="day"
                            type="number"
                            min="1"
                            max="31"
                            value={formData.recurrence_day}
                            onChange={(e) => setFormData({ ...formData, recurrence_day: parseInt(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned (optional)" />
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

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Auto-skip Conflicts</p>
                        <p className="text-xs text-muted-foreground">
                          Skip generating jobs when time conflicts are detected
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.auto_skip_conflicts}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_skip_conflicts: checked })}
                    />
                  </div>

                  <Button
                    onClick={handleCreateTemplate}
                    disabled={!formData.name}
                    className="w-full"
                  >
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No recurring job templates yet. Create one to automate job scheduling.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template: any) => {
                const totalGenerated = template.instances?.length || 0;
                const skippedCount = template.instances?.filter((i: any) => i.was_skipped).length || 0;

                return (
                  <Card key={template.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{template.name}</h3>
                            {template.is_active ? (
                              <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                            <Badge variant="outline">
                              {getRecurrenceLabel(template.recurrence_pattern, template.recurrence_day)}
                            </Badge>
                          </div>

                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(template.start_date), 'MMM d, yyyy')}</span>
                              {template.end_date && (
                                <span>- {format(new Date(template.end_date), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                            <span>•</span>
                            <span>{template.start_time.slice(0, 5)} - {template.end_time.slice(0, 5)}</span>
                            {template.assigned_profile && (
                              <>
                                <span>•</span>
                                <span>Assigned to {template.assigned_profile.full_name || template.assigned_profile.email}</span>
                              </>
                            )}
                          </div>

                          {totalGenerated > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                              <Badge variant="outline">{totalGenerated} jobs generated</Badge>
                              {skippedCount > 0 && (
                                <Badge variant="outline" className="text-orange-500">
                                  {skippedCount} skipped (conflicts)
                                </Badge>
                              )}
                              <Link to="/schedule" className="text-accent hover:underline flex items-center gap-1">
                                View in Schedule
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                              <Link to="/projects" className="text-accent hover:underline flex items-center gap-1">
                                View All Jobs
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateJobs(template.id)}
                            disabled={generating === template.id || !template.is_active}
                          >
                            {generating === template.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Generate Now
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(template.id, template.is_active)}
                          >
                            {template.is_active ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
