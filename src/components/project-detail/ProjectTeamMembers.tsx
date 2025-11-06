import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ProjectTeamMembersProps {
  projectId: string;
}

type TeamMember = {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  is_active: boolean;
  profiles: {
    full_name: string | null;
    email: string;
  };
};

export default function ProjectTeamMembers({ projectId }: ProjectTeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_members' as any)
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setMembers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members' as any)
        .update({ is_active: false } as any)
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member Removed',
        description: 'Team member has been removed from the project',
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'project_manager': return 'bg-purple-500 text-white';
      case 'coordinator': return 'bg-blue-500 text-white';
      case 'technician': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage project team assignments</CardDescription>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No team members assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <Avatar>
                  <AvatarFallback>
                    {(member.profiles?.full_name || member.profiles?.email || '?')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {member.profiles?.full_name || member.profiles?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.profiles?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added {formatDistanceToNow(new Date(member.assigned_at), { addSuffix: true })}
                  </p>
                </div>

                <Badge className={getRoleColor(member.role)}>
                  {member.role.replace('_', ' ').toUpperCase()}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
