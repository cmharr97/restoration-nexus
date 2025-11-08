import { useLeads, Lead, LeadStatus } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight, DollarSign } from "lucide-react";
import { useState } from "react";

const COLUMNS: { status: LeadStatus; title: string; color: string }[] = [
  { status: 'new', title: 'New', color: 'bg-blue-500' },
  { status: 'contacted', title: 'Contacted', color: 'bg-purple-500' },
  { status: 'qualified', title: 'Qualified', color: 'bg-yellow-500' },
  { status: 'converted', title: 'Converted', color: 'bg-green-500' },
  { status: 'lost', title: 'Lost', color: 'bg-red-500' },
];

export function LeadKanban() {
  const { leads, updateLead } = useLeads();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: LeadStatus) => {
    if (draggedLead && draggedLead.status !== status) {
      await updateLead(draggedLead.id, { status });
      setDraggedLead(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getDamageTypeColor = (type: string) => {
    switch (type) {
      case 'water': return 'bg-blue-500';
      case 'fire': return 'bg-red-500';
      case 'mold': return 'bg-green-500';
      case 'storm': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <div 
          key={column.status}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.status)}
        >
          <Card className={`border-t-4 ${column.color.replace('bg-', 'border-t-')}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">{column.title}</span>
                <Badge variant="secondary">{getLeadsByStatus(column.status).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getLeadsByStatus(column.status).map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  className="cursor-move hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold">{lead.customer_name}</div>
                      <Badge className={getUrgencyColor(lead.urgency)} variant="secondary">
                        {lead.urgency}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Badge className={getDamageTypeColor(lead.damage_type)}>
                        {lead.damage_type}
                      </Badge>
                    </div>

                    {lead.address && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.address}
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {lead.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.customer_phone}
                        </div>
                      )}
                      {lead.customer_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.customer_email}
                        </div>
                      )}
                    </div>

                    {lead.ai_damage_estimate && (
                      <div className="text-xs flex items-center gap-1 text-accent">
                        <DollarSign className="h-3 w-3" />
                        AI Est: ${lead.ai_damage_estimate.toLocaleString()}
                      </div>
                    )}

                    {lead.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {lead.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      {column.status === 'qualified' && (
                        <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Convert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getLeadsByStatus(column.status).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No {column.title.toLowerCase()} leads
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
