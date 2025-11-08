import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkflowHandoffs } from "@/hooks/useWorkflowHandoffs";
import { ArrowRight, Check, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface WorkflowHandoffsProps {
  projectId: string;
  organizationId: string;
}

const PHASES = [
  { value: 'recon', label: 'Recon Assessment' },
  { value: 'mitigation', label: 'Mitigation' },
  { value: 'contents', label: 'Contents Pack/Inventory' },
  { value: 'reconstruction', label: 'Reconstruction' },
  { value: 'closeout', label: 'Project Closeout' },
];

export function WorkflowHandoffs({ projectId, organizationId }: WorkflowHandoffsProps) {
  const { handoffs, loading, createHandoff, acceptHandoff, rejectHandoff } = useWorkflowHandoffs(projectId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    from_phase: 'recon',
    to_phase: 'mitigation',
    notes: '',
  });

  const handleCreate = async () => {
    const result = await createHandoff({
      project_id: projectId,
      from_phase: formData.from_phase,
      to_phase: formData.to_phase,
      notes: formData.notes,
      status: 'pending',
      handoff_data: {},
    });

    if (result) {
      setOpen(false);
      setFormData({ from_phase: 'recon', to_phase: 'mitigation', notes: '' });
    }
  };

  const getPhaseLabel = (phase: string) => {
    return PHASES.find(p => p.value === phase)?.label || phase;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflow Handoffs</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              <ArrowRight className="mr-2 h-4 w-4" />
              Create Handoff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Phase Handoff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>From Phase</Label>
                <Select value={formData.from_phase} onValueChange={(val) => setFormData({ ...formData, from_phase: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map(phase => (
                      <SelectItem key={phase.value} value={phase.value}>
                        {phase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To Phase</Label>
                <Select value={formData.to_phase} onValueChange={(val) => setFormData({ ...formData, to_phase: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map(phase => (
                      <SelectItem key={phase.value} value={phase.value}>
                        {phase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Handoff Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any important information for the next team..."
                  rows={4}
                />
              </div>

              <Button onClick={handleCreate} className="w-full bg-accent hover:bg-accent/90">
                Create Handoff
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading handoffs...</div>
        ) : handoffs.length > 0 ? (
          <div className="space-y-4">
            {handoffs.map((handoff) => (
              <div key={handoff.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge>{getPhaseLabel(handoff.from_phase)}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge>{getPhaseLabel(handoff.to_phase)}</Badge>
                  </div>
                  <Badge className={getStatusColor(handoff.status)} variant="secondary">
                    {handoff.status}
                  </Badge>
                </div>

                {handoff.notes && (
                  <p className="text-sm text-muted-foreground">{handoff.notes}</p>
                )}

                <div className="text-xs text-muted-foreground">
                  Created: {new Date(handoff.created_at).toLocaleDateString()}
                </div>

                {handoff.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acceptHandoff(handoff.id)}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectHandoff(handoff.id, 'Not ready')}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No handoffs yet. Create a handoff to pass work to the next phase.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
