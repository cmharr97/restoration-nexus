import { useState, useEffect, useRef } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Hash, User, Plus, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TeamChat() {
  return (
    <ProtectedRoute requireOrganization>
      <TeamChatContent />
    </ProtectedRoute>
  );
}

function TeamChatContent() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, [organization]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${selectedChannel}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${selectedChannel}`
        }, () => {
          fetchMessages(selectedChannel);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    if (!organization || !user) return;

    try {
      const { data, error } = await (supabase
        .from('chat_channels' as any)
        .select(`
          *,
          members:chat_channel_members!inner (
            user_id
          )
        `)
        .eq('organization_id', organization.id)
        .eq('members.user_id', user.id) as any);

      if (error) throw error;
      
      const channelsData = (data as any) || [];
      setChannels(channelsData);
      
      // Auto-select first channel or general
      if (channelsData.length > 0 && !selectedChannel) {
        const general = channelsData.find((c: any) => c.name === 'general');
        setSelectedChannel(general?.id || channelsData[0].id);
      } else if (channelsData.length === 0) {
        // Create default general channel
        await createDefaultChannel();
      }
    } catch (error: any) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultChannel = async () => {
    if (!organization || !user) return;

    try {
      const { data: channel, error: channelError} = await (supabase
        .from('chat_channels' as any)
        .insert({
          organization_id: organization.id,
          name: 'general',
          description: 'General team discussion',
          created_by: user.id,
        })
        .select()
        .single() as any);

      if (channelError) throw channelError;

      // Add all org members to general channel
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organization.id)
        .eq('is_active', true);

      if (members) {
        await supabase
          .from('chat_channel_members' as any)
          .insert(
            members.map((m: any) => ({
              channel_id: channel.id,
              user_id: m.user_id,
            }))
          );
      }

      fetchChannels();
    } catch (error: any) {
      console.error('Error creating default channel:', error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await (supabase
        .from('chat_messages' as any)
        .select(`
          *,
          sender:user_id (
            full_name,
            email
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100) as any);

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChannel || !user || !messageInput.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages' as any)
        .insert({
          channel_id: selectedChannel,
          user_id: user.id,
          content: messageInput.trim(),
        });

      if (error) throw error;

      setMessageInput('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const selectedChannelData = channels.find((c: any) => c.id === selectedChannel);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 flex h-[calc(100vh-4rem)]">
        {/* Channels Sidebar */}
        <div className="w-64 border-r border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Channels</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {channels.map((channel: any) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  {channel.is_direct_message ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Hash className="h-4 w-4" />
                  )}
                  <span className="text-sm truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  <h1 className="text-xl font-semibold">{selectedChannelData?.name}</h1>
                </div>
                {selectedChannelData?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedChannelData.description}
                  </p>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold flex-shrink-0">
                        {message.sender?.full_name?.[0]?.toUpperCase() || message.sender?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {message.sender?.full_name || message.sender?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={`Message #${selectedChannelData?.name}`}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a channel to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
