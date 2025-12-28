import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pin, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  title: string;
  body: string;
  message_type: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
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
      const { data, error } = await supabase
        .from('project_messages')
        .select('*, profiles:user_id(full_name)')
        .eq('project_id', projectId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleSubmit = async () => {
    if (!newMessage.title.trim() || !newMessage.body.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          organization_id: organizationId,
          user_id: user.id,
          title: newMessage.title,
          body: newMessage.body,
          message_type: newMessage.message_type
        });

      if (error) throw error;

      toast({ title: 'Message posted!' });
      setNewMessage({ title: '', body: '', message_type: 'discussion' });
      setDialogOpen(false);
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

  const togglePin = async (messageId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('project_messages')
        .update({ is_pinned: !currentPinned })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('project_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      toast({ title: 'Message deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-accent text-accent-foreground';
      case 'update': return 'bg-info text-info-foreground';
      case 'question': return 'bg-warning text-warning-foreground';
      case 'fyi': return 'bg-secondary text-secondary-foreground';
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
                <Select 
                  value={newMessage.message_type} 
                  onValueChange={(v) => setNewMessage({ ...newMessage, message_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">💬 Discussion</SelectItem>
                    <SelectItem value="announcement">📢 Announcement</SelectItem>
                    <SelectItem value="update">📝 Update</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="fyi">ℹ️ FYI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Type a title..."
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  className="text-lg font-medium"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your message here..."
                  rows={8}
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                />
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
              Start a discussion or post an announcement for your team
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
            <Card key={message.id} className={`hover:shadow-md transition-shadow ${message.is_pinned ? 'border-accent' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {message.profiles?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{message.profiles?.full_name || 'Unknown'}</span>
                      <Badge className={getTypeColor(message.message_type)} variant="secondary">
                        {message.message_type}
                      </Badge>
                      {message.is_pinned && (
                        <Badge variant="outline" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{message.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{message.body}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => togglePin(message.id, message.is_pinned)}
                      >
                        <Pin className={`h-4 w-4 mr-1 ${message.is_pinned ? 'text-accent' : ''}`} />
                        {message.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      {(message.user_id === user?.id) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
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
