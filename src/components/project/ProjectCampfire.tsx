import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface ProjectCampfireProps {
  projectId: string;
  projectName: string;
}

export function ProjectCampfire({ projectId, projectName }: ProjectCampfireProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find or create channel for this project
  useEffect(() => {
    const initChannel = async () => {
      if (!user || !organization) {
        setLoading(false);
        return;
      }

      try {
        const channelName = `project-${projectId}`;
        
        // Check if channel exists
        const { data: existingChannel } = await supabase
          .from('chat_channels')
          .select('id')
          .eq('name', channelName)
          .maybeSingle();

        if (existingChannel) {
          setChannelId(existingChannel.id);
          
          // Ensure current user is a member
          const { data: membership } = await supabase
            .from('chat_channel_members')
            .select('id')
            .eq('channel_id', existingChannel.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!membership) {
            await supabase
              .from('chat_channel_members')
              .insert({
                channel_id: existingChannel.id,
                user_id: user.id
              });
          }
        } else {
          // Create channel for this project
          const { data: newChannel, error: createError } = await supabase
            .from('chat_channels')
            .insert({
              name: channelName,
              description: `Campfire for ${projectName}`,
              organization_id: organization.id,
              created_by: user.id,
              is_direct_message: false
            })
            .select('id')
            .single();

          if (createError) throw createError;

          if (newChannel) {
            setChannelId(newChannel.id);
            
            // Add creator as member
            await supabase
              .from('chat_channel_members')
              .insert({
                channel_id: newChannel.id,
                user_id: user.id
              });
          }
        }
      } catch (error) {
        console.error('Error initializing channel:', error);
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [projectId, projectName, user, organization]);

  // Fetch messages when channel is set
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles:user_id(full_name)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as any);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`campfire-${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        // Fetch the new message with profile info
        supabase
          .from('chat_messages')
          .select('*, profiles:user_id(full_name)')
          .eq('id', payload.new.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setMessages(prev => [...prev, data as any]);
            }
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !channelId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
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
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Flame className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold">Campfire</h2>
          <p className="text-muted-foreground">Real-time chat for {projectName}</p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="h-[500px] flex flex-col">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Flame className="h-12 w-12 mx-auto mb-4 text-accent animate-pulse" />
                <p className="text-muted-foreground">
                  🔥 The campfire is warm and ready. Say hello!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={isOwn ? 'bg-accent text-accent-foreground' : 'bg-secondary'}>
                      {msg.profiles?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    <div className="text-xs text-muted-foreground mb-1">
                      {msg.profiles?.full_name || 'Unknown'}
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-2xl ${
                      isOwn 
                        ? 'bg-accent text-accent-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={sending}
            />
            <Button 
              className="bg-accent hover:bg-accent/90"
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
