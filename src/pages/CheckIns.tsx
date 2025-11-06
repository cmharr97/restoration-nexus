import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Clock, Zap, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function CheckIns() {
  return (
    <ProtectedRoute requireOrganization>
      <CheckInsContent />
    </ProtectedRoute>
  );
}

function CheckInsContent() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    what_accomplished: '',
    what_planning: '',
    blockers: '',
    mood: 'good',
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchCheckIns();
  }, [organization]);

  const fetchCheckIns = async () => {
    if (!organization) return;

    try {
      // Get today's check-in for current user
      const { data: userCheckIn } = await (supabase
        .from('check_ins' as any)
        .select('*')
        .eq('user_id', user?.id)
        .eq('check_in_date', today)
        .maybeSingle() as any);

      setTodayCheckIn(userCheckIn as any);

      if (userCheckIn) {
        const checkIn = userCheckIn as any;
        setFormData({
          what_accomplished: checkIn.what_accomplished || '',
          what_planning: checkIn.what_planning || '',
          blockers: checkIn.blockers || '',
          mood: checkIn.mood || 'good',
        });
      }

      // Get recent check-ins from team
      const { data: recentCheckIns, error } = await (supabase
        .from('check_ins' as any)
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .eq('organization_id', organization.id)
        .gte('check_in_date', format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
        .order('check_in_date', { ascending: false })
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setCheckIns((recentCheckIns as any) || []);
    } catch (error: any) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!organization || !user) return;

    setSubmitting(true);
    try {
      if (todayCheckIn) {
        // Update existing
        const { error } = await supabase
          .from('check_ins' as any)
          .update({
            what_accomplished: formData.what_accomplished || null,
            what_planning: formData.what_planning || null,
            blockers: formData.blockers || null,
            mood: formData.mood,
          })
          .eq('id', todayCheckIn.id);

        if (error) throw error;

        toast({
          title: 'Check-in Updated',
          description: 'Your daily check-in has been updated',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('check_ins' as any)
          .insert({
            organization_id: organization.id,
            user_id: user.id,
            check_in_date: today,
            what_accomplished: formData.what_accomplished || null,
            what_planning: formData.what_planning || null,
            blockers: formData.blockers || null,
            mood: formData.mood,
          });

        if (error) throw error;

        toast({
          title: 'Check-in Submitted',
          description: 'Your daily check-in has been recorded',
        });
      }

      fetchCheckIns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '🎉';
      case 'good': return '😊';
      case 'okay': return '😐';
      case 'struggling': return '😰';
      default: return '😊';
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'great': return 'Great';
      case 'good': return 'Good';
      case 'okay': return 'Okay';
      case 'struggling': return 'Struggling';
      default: return 'Good';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline mb-2">Daily Check-ins</h1>
            <p className="text-muted-foreground text-lg">
              Share progress and stay aligned with your team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {checkIns.filter((c: any) => c.check_in_date === today).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{checkIns.length}</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {checkIns.filter((c: any) => c.blockers).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Blockers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Check-in Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Check-in for {format(new Date(), 'EEEE, MMMM d')}</CardTitle>
              <CardDescription>
                {todayCheckIn ? 'Update your check-in for today' : 'Submit your daily check-in'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="accomplished">What did you accomplish today?</Label>
                <Textarea
                  id="accomplished"
                  value={formData.what_accomplished}
                  onChange={(e) => setFormData({ ...formData, what_accomplished: e.target.value })}
                  placeholder="List your completed tasks and achievements..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="planning">What are you planning to work on?</Label>
                <Textarea
                  id="planning"
                  value={formData.what_planning}
                  onChange={(e) => setFormData({ ...formData, what_planning: e.target.value })}
                  placeholder="Share your plans and priorities..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="blockers">Any blockers or concerns?</Label>
                <Textarea
                  id="blockers"
                  value={formData.blockers}
                  onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                  placeholder="What's standing in your way?"
                  rows={2}
                />
              </div>

              <div>
                <Label>How are you feeling?</Label>
                <div className="flex gap-2 mt-2">
                  {['great', 'good', 'okay', 'struggling'].map((mood) => (
                    <Button
                      key={mood}
                      variant={formData.mood === mood ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, mood })}
                    >
                      {getMoodEmoji(mood)} {getMoodLabel(mood)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmitCheckIn} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {todayCheckIn ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    {todayCheckIn ? 'Update Check-in' : 'Submit Check-in'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Team Check-ins */}
          <h2 className="text-2xl font-semibold mb-4">Team Activity</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : checkIns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No check-ins yet this week</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {checkIns.map((checkIn: any) => (
                <Card key={checkIn.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {checkIn.user?.full_name || checkIn.user?.email}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(checkIn.check_in_date), 'EEEE, MMMM d')}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {getMoodEmoji(checkIn.mood)} {getMoodLabel(checkIn.mood)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {checkIn.what_accomplished && (
                      <div>
                        <p className="text-sm font-semibold mb-1">✅ Accomplished</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {checkIn.what_accomplished}
                        </p>
                      </div>
                    )}
                    {checkIn.what_planning && (
                      <div>
                        <p className="text-sm font-semibold mb-1">📋 Planning</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {checkIn.what_planning}
                        </p>
                      </div>
                    )}
                    {checkIn.blockers && (
                      <div>
                        <p className="text-sm font-semibold mb-1 text-orange-500">⚠️ Blockers</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {checkIn.blockers}
                        </p>
                      </div>
                    )}
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
