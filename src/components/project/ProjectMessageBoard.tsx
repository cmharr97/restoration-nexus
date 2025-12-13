import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pin, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  title: string;
  body: string;
  message_type: string;
  is_pinned: boolean;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface ProjectMessageBoardProps {
  projectId: string;
  organizationId: string;
}

export function ProjectMessageBoard({ projectId, organizationId }: ProjectMessageBoardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    body: '',
    message_type: 'discussion'
  });

  const fetchMessages = async () => {
    try {
      // For now, we'll use announcements as messages since we have that table
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, category, is_pinned, created_at, profiles:created_by(full_name)')
        .eq('organization_id', organizationId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to message format
      const transformed = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        body: d.content,
        message_type: d.category,
        is_pinned: d.is_pinned,
        created_at: d.created_at,
        profiles: d.profiles
      }));
      
      setMessages(transformed);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [projectId, organizationId]);

  const handleSubmit = async () => {
    if (!newMessage.title.trim() || !newMessage.body.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: newMessage.title,
          content: newMessage.body,
          category: newMessage.message_type,
          organization_id: organizationId,
          created_by: user.id,
          is_pinned: false,
          priority: 'normal'
        });

      if (error) throw error;

      toast({ title: 'Message posted!' });
      setNewMessage({ title: '', body: '', message_type: 'discussion' });
      setDialogOpen(false);
      fetchMessages();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-accent text-accent-foreground';
      case 'update': return 'bg-info text-info-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold">Message Board</h2>
          <p className="text-muted-foreground">Team discussions, announcements, and updates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post a New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Title..."
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your message here..."
                  rows={6}
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                />
              </div>
              <div>
                <Select 
                  value={newMessage.message_type} 
                  onValueChange={(v) => setNewMessage({ ...newMessage, message_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleSubmit}
                  disabled={submitting || !newMessage.title.trim() || !newMessage.body.trim()}
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Post Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a discussion or post an update
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Post First Message
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {message.profiles?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{message.profiles?.full_name || 'Unknown'}</span>
                      <Badge className={getTypeColor(message.message_type)} variant="secondary">
                        {message.message_type}
                      </Badge>
                      {message.is_pinned && (
                        <Pin className="h-3.5 w-3.5 text-accent" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{message.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{message.body}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
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
