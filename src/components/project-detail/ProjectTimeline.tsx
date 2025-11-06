import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Edit2, Save, X } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface ProjectTimelineProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<any>;
}

export default function ProjectTimeline({ project, onUpdate }: ProjectTimelineProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    start_date: project.start_date,
    target_completion_date: project.target_completion_date,
    actual_completion_date: project.actual_completion_date,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(project.id, formData);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      start_date: project.start_date,
      target_completion_date: project.target_completion_date,
      actual_completion_date: project.actual_completion_date,
    });
    setEditing(false);
  };

  const calculateDuration = () => {
    if (!project.start_date || !project.target_completion_date) return null;
    const start = new Date(project.start_date);
    const end = new Date(project.target_completion_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgress = () => {
    if (!project.start_date || !project.target_completion_date) return 0;
    const start = new Date(project.start_date).getTime();
    const end = new Date(project.target_completion_date).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Manage project schedule and milestones</CardDescription>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.start_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label>Target Completion</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.target_completion_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.target_completion_date
                    ? new Date(project.target_completion_date).toLocaleDateString()
                    : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label>Actual Completion</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.actual_completion_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, actual_completion_date: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.actual_completion_date
                    ? new Date(project.actual_completion_date).toLocaleDateString()
                    : 'Not completed'}
                </p>
              )}
            </div>
          </div>

          {calculateDuration() && (
            <div>
              <Label>Project Duration</Label>
              <p className="text-2xl font-bold mt-2">{calculateDuration()} days</p>
            </div>
          )}

          {project.start_date && project.target_completion_date && !project.actual_completion_date && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Progress</Label>
                <span className="text-sm text-muted-foreground">{Math.round(getProgress())}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Milestones
          </CardTitle>
          <CardDescription>Coming soon: Add and track project milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Milestone tracking will be available soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
