import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface ProjectOverviewProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<any>;
}

export default function ProjectOverview({ project, onUpdate }: ProjectOverviewProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(project.id, formData);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData(project);
    setEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'on_hold': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'lead': return 'bg-info text-info-foreground';
      case 'opportunity': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLossTypeColor = (lossType: string) => {
    switch (lossType) {
      case 'water': return 'bg-blue-500 text-white';
      case 'fire': return 'bg-orange-500 text-white';
      case 'mold': return 'bg-green-500 text-white';
      case 'storm': return 'bg-purple-500 text-white';
      case 'reconstruction': return 'bg-gray-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project Information</CardTitle>
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Project Name</Label>
              {editing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.name}</p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              {editing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            <div>
              <Label>Loss Type</Label>
              {editing ? (
                <Select
                  value={formData.loss_type}
                  onValueChange={(value: any) => setFormData({ ...formData, loss_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="mold">Mold</SelectItem>
                    <SelectItem value="storm">Storm</SelectItem>
                    <SelectItem value="reconstruction">Reconstruction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getLossTypeColor(project.loss_type)}>
                  {project.loss_type.toUpperCase()}
                </Badge>
              )}
            </div>

            <div>
              <Label>Loss Date</Label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.loss_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, loss_date: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.loss_date ? new Date(project.loss_date).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Address</Label>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                <Input
                  placeholder="Street Address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  placeholder="ZIP"
                  value={formData.zip || ''}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            ) : (
              <p className="text-sm mt-1">
                {project.address && `${project.address}, `}
                {project.city && `${project.city}, `}
                {project.state} {project.zip}
              </p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            {editing ? (
              <Textarea
                value={formData.loss_description || ''}
                onChange={(e) => setFormData({ ...formData, loss_description: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm mt-1">{project.loss_description || 'No description'}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Estimated Cost</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.estimated_cost || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.estimated_cost ? `$${project.estimated_cost.toLocaleString()}` : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label>Actual Cost</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.actual_cost || ''}
                  onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.actual_cost ? `$${project.actual_cost.toLocaleString()}` : 'Not set'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Insurance Carrier</Label>
              {editing ? (
                <Input
                  value={formData.insurance_carrier || ''}
                  onChange={(e) => setFormData({ ...formData, insurance_carrier: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.insurance_carrier || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Policy Number</Label>
              {editing ? (
                <Input
                  value={formData.policy_number || ''}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.policy_number || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Claim Number</Label>
              {editing ? (
                <Input
                  value={formData.claim_number || ''}
                  onChange={(e) => setFormData({ ...formData, claim_number: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.claim_number || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Deductible</Label>
              {editing ? (
                <Input
                  type="number"
                  value={formData.deductible || ''}
                  onChange={(e) => setFormData({ ...formData, deductible: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">
                  {project.deductible ? `$${project.deductible.toLocaleString()}` : 'Not set'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Adjuster Name</Label>
              {editing ? (
                <Input
                  value={formData.adjuster_name || ''}
                  onChange={(e) => setFormData({ ...formData, adjuster_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.adjuster_name || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Adjuster Email</Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.adjuster_email || ''}
                  onChange={(e) => setFormData({ ...formData, adjuster_email: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.adjuster_email || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Adjuster Phone</Label>
              {editing ? (
                <Input
                  value={formData.adjuster_phone || ''}
                  onChange={(e) => setFormData({ ...formData, adjuster_phone: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.adjuster_phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Owner Name</Label>
              {editing ? (
                <Input
                  value={formData.owner_name || ''}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.owner_name || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Owner Email</Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.owner_email || ''}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.owner_email || 'Not set'}</p>
              )}
            </div>

            <div>
              <Label>Owner Phone</Label>
              {editing ? (
                <Input
                  value={formData.owner_phone || ''}
                  onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{project.owner_phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
