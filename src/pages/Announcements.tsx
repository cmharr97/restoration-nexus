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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Plus, Pin, MessageCircle, ThumbsUp, Heart, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Announcements() {
  return (
    <ProtectedRoute requireOrganization>
      <AnnouncementsContent />
    </ProtectedRoute>
  );
}

function AnnouncementsContent() {
  const { organization, hasRole } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    is_pinned: false,
  });

  const canManage = hasRole(['owner', 'admin', 'executive']);

  useEffect(() => {
    fetchAnnouncements();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization]);

  const fetchAnnouncements = async () => {
    if (!organization) return;

    try {
      const { data, error } = await (supabase
        .from('announcements' as any)
        .select(`
          *,
          creator:created_by (
            full_name,
            email
          ),
          reactions:announcement_reactions (
            id,
            reaction,
            user_id
          ),
          comments:announcement_comments (
            id,
            content,
            created_at,
            user:user_id (
              full_name,
              email
            )
          )
        `)
        .eq('organization_id', organization.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setAnnouncements((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!organization || !user || !formData.title || !formData.content) return;

    try {
      const { error } = await supabase
        .from('announcements' as any)
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          priority: formData.priority,
          is_pinned: formData.is_pinned,
        });

      if (error) throw error;

      toast({
        title: 'Announcement Posted',
        description: 'Your announcement has been shared with the team',
      });

      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        is_pinned: false,
      });
      setShowCreate(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReaction = async (announcementId: string, reaction: string) => {
    if (!user) return;

    try {
      // Check if already reacted
      const { data: existing } = await (supabase
        .from('announcement_reactions' as any)
        .select('id')
        .eq('announcement_id', announcementId)
        .eq('user_id', user.id)
        .eq('reaction', reaction)
        .maybeSingle() as any);

      if (existing) {
        // Remove reaction
        await supabase
          .from('announcement_reactions' as any)
          .delete()
          .eq('id', (existing as any).id);
      } else {
        // Add reaction
        await supabase
          .from('announcement_reactions' as any)
          .insert({
            announcement_id: announcementId,
            user_id: user.id,
            reaction,
          });
      }

      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2">Announcements</h1>
              <p className="text-muted-foreground text-lg">
                Company updates and important information
              </p>
            </div>
            
            {canManage && (
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                      Share important updates with your team
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Important update..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share the details..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="safety">Safety</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Priority</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_pinned}
                            onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Pin to top</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreate} disabled={!formData.title || !formData.content}>
                        Post Announcement
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreate(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement: any) => (
                <Card key={announcement.id} className={announcement.is_pinned ? 'border-accent' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.is_pinned && <Pin className="h-4 w-4 text-accent" />}
                          <Badge variant={getPriorityColor(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                          <Badge variant="outline">{announcement.category}</Badge>
                        </div>
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>
                      Posted by {announcement.creator?.full_name || announcement.creator?.email} • {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(announcement.id, 'like')}
                        className="gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {announcement.reactions?.filter((r: any) => r.reaction === 'like').length || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(announcement.id, 'heart')}
                        className="gap-2"
                      >
                        <Heart className="h-4 w-4" />
                        {announcement.reactions?.filter((r: any) => r.reaction === 'heart').length || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {announcement.comments?.length || 0}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
