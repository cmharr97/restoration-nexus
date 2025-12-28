import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
};

export default function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    loss_type: 'water' as const,
    loss_date: '',
    loss_description: '',
    status: 'lead' as const,
    job_type: 'mitigation' as const,
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    insurance_carrier: '',
    policy_number: '',
    claim_number: '',
    adjuster_name: '',
    adjuster_email: '',
    adjuster_phone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        loss_type: 'water',
        loss_date: '',
        loss_description: '',
        status: 'lead',
        job_type: 'mitigation',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        insurance_carrier: '',
        policy_number: '',
        claim_number: '',
        adjuster_name: '',
        adjuster_email: '',
        adjuster_phone: '',
        notes: '',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Create New Project</DialogTitle>
          <DialogDescription>Enter the project details to get started</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="property">Property</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="loss">Loss Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="123 Main St - Water Damage"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type *</Label>
                <Select value={formData.job_type} onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recon">Recon</SelectItem>
                    <SelectItem value="mitigation">Mitigation</SelectItem>
                    <SelectItem value="contents">Contents</SelectItem>
                    <SelectItem value="reconstruction">Reconstruction</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional project notes..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="property" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Property Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_email">Owner Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Owner Phone</Label>
                  <Input
                    id="owner_phone"
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_carrier">Insurance Carrier</Label>
                <Input
                  id="insurance_carrier"
                  value={formData.insurance_carrier}
                  onChange={(e) => setFormData({ ...formData, insurance_carrier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claim_number">Claim Number</Label>
                  <Input
                    id="claim_number"
                    value={formData.claim_number}
                    onChange={(e) => setFormData({ ...formData, claim_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjuster_name">Adjuster Name</Label>
                <Input
                  id="adjuster_name"
                  value={formData.adjuster_name}
                  onChange={(e) => setFormData({ ...formData, adjuster_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adjuster_email">Adjuster Email</Label>
                  <Input
                    id="adjuster_email"
                    type="email"
                    value={formData.adjuster_email}
                    onChange={(e) => setFormData({ ...formData, adjuster_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjuster_phone">Adjuster Phone</Label>
                  <Input
                    id="adjuster_phone"
                    type="tel"
                    value={formData.adjuster_phone}
                    onChange={(e) => setFormData({ ...formData, adjuster_phone: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loss" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="loss_type">Loss Type *</Label>
                <Select value={formData.loss_type} onValueChange={(value: any) => setFormData({ ...formData, loss_type: value })}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="loss_date">Loss Date</Label>
                <Input
                  id="loss_date"
                  type="date"
                  value={formData.loss_date}
                  onChange={(e) => setFormData({ ...formData, loss_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loss_description">Loss Description</Label>
                <Textarea
                  id="loss_description"
                  value={formData.loss_description}
                  onChange={(e) => setFormData({ ...formData, loss_description: e.target.value })}
                  placeholder="Describe the loss incident..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
