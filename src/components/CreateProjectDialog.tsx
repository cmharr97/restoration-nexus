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

const initialFormData = {
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
  priority: 'medium' as const,
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  insurance_carrier: '',
  policy_number: '',
  claim_number: '',
  tpa_name: '',
  adjuster_name: '',
  adjuster_email: '',
  adjuster_phone: '',
  deductible: '',
  estimated_cost: '',
  notes: '',
};

export default function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        deductible: formData.deductible ? parseFloat(formData.deductible) : null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      };
      await onSubmit(submitData);
      setFormData(initialFormData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">New Restoration Job</DialogTitle>
          <DialogDescription>Enter the job details to create a new project</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="job" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="job">Job Info</TabsTrigger>
              <TabsTrigger value="property">Property & Customer</TabsTrigger>
              <TabsTrigger value="insurance">Insurance & Claims</TabsTrigger>
              <TabsTrigger value="loss">Loss Details</TabsTrigger>
            </TabsList>

            {/* Job Info Tab */}
            <TabsContent value="job" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Job Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smith Residence - Water Loss"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loss_type">Loss Type *</Label>
                  <Select value={formData.loss_type} onValueChange={(value: any) => setFormData({ ...formData, loss_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">Water Damage</SelectItem>
                      <SelectItem value="fire">Fire / Smoke Damage</SelectItem>
                      <SelectItem value="mold">Mold Remediation</SelectItem>
                      <SelectItem value="storm">Storm / Wind Damage</SelectItem>
                      <SelectItem value="reconstruction">Reconstruction Only</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type">Primary Service *</Label>
                  <Select value={formData.job_type} onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Response</SelectItem>
                      <SelectItem value="inspection">Inspection / Assessment</SelectItem>
                      <SelectItem value="recon">Recon / Estimating</SelectItem>
                      <SelectItem value="mitigation">Mitigation / Drying</SelectItem>
                      <SelectItem value="contents">Contents Pack-Out</SelectItem>
                      <SelectItem value="reconstruction">Reconstruction / Rebuild</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent / Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Job Value ($)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this job..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Property & Customer Tab */}
            <TabsContent value="property" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="address">Loss Location Address</Label>
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
                    placeholder="FL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="33101"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Property Owner / Insured</h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name">Full Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_email">Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    placeholder="john@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Phone</Label>
                  <Input
                    id="owner_phone"
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Insurance & Claims Tab */}
            <TabsContent value="insurance" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_carrier">Insurance Carrier</Label>
                  <Input
                    id="insurance_carrier"
                    value={formData.insurance_carrier}
                    onChange={(e) => setFormData({ ...formData, insurance_carrier: e.target.value })}
                    placeholder="State Farm, Allstate, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tpa_name">TPA (Third Party Administrator)</Label>
                  <Input
                    id="tpa_name"
                    value={formData.tpa_name}
                    onChange={(e) => setFormData({ ...formData, tpa_name: e.target.value })}
                    placeholder="e.g. Alacrity, Crawford"
                  />
                </div>
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
                <Label htmlFor="deductible">Deductible ($)</Label>
                <Input
                  id="deductible"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductible}
                  onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                  placeholder="1,000.00"
                />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Adjuster Information</h4>
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

            {/* Loss Details Tab */}
            <TabsContent value="loss" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="loss_date">Date of Loss</Label>
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
                  placeholder="Describe the loss: source of damage, affected areas, extent of damage, etc."
                  rows={5}
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
                  Creating Job...
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
