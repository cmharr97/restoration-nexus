import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare, Plus, Trash2, Loader2, ListTodo, Search, AlertTriangle, Clock, Filter } from 'lucide-react';

export default function Tasks() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);
  const [listName, setListName] = useState('');
  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organization?.id) return;
    fetchTaskLists();
  }, [organization?.id]);

  const fetchTaskLists = async () => {
    if (!organization) return;
    try {
      const { data, error } = await supabase
        .from('task_lists' as any)
        .select(`*, tasks:tasks (*, assigned:assigned_to (full_name, email))`)
        .eq('organization_id', organization.id)
        .is('project_id', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTaskLists(data || []);
    } catch (error: any) {
      console.error('Error fetching task lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!organization || !user || !listName.trim()) return;
    try {
      const { error } = await supabase
        .from('task_lists' as any)
        .insert({ organization_id: organization.id, name: listName.trim(), created_by: user.id });
      if (error) throw error;
      toast({ title: 'List created' });
      setListName('');
      setShowCreateList(false);
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddTask = async (taskListId: string) => {
    if (!user || !newTask[taskListId]?.trim()) return;
    try {
      const taskList = taskLists.find((l: any) => l.id === taskListId);
      const maxPosition = Math.max(...(taskList?.tasks?.map((t: any) => t.position) || [0]), 0);
      const { error } = await supabase
        .from('tasks' as any)
        .insert({ task_list_id: taskListId, title: newTask[taskListId].trim(), position: maxPosition + 1, created_by: user.id });
      if (error) throw error;
      setNewTask({ ...newTask, [taskListId]: '' });
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase.from('tasks' as any).update({
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
        completed_by: !isCompleted ? user?.id : null,
      }).eq('id', taskId);
      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks' as any).delete().eq('id', taskId);
      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const allTasks = taskLists.flatMap((l: any) => (l.tasks || []).map((t: any) => ({ ...t, listName: l.name })));
  const overdue = allTasks.filter(t => !t.is_completed && t.due_date && new Date(t.due_date) < new Date());
  const completed = allTasks.filter(t => t.is_completed);
  const pending = allTasks.filter(t => !t.is_completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{pending.length} open · {overdue.length} overdue</p>
        </div>
        <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> New List</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-headline">Create Task List</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">List Name</Label><Input value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g., Weekly Punch Items" /></div>
              <Button onClick={handleCreateList} disabled={!listName.trim()} className="w-full">Create List</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card"><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Open</div><div className="text-2xl font-bold font-headline">{pending.length}</div></div>
        <div className="stat-card"><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overdue</div><div className="text-2xl font-bold font-headline text-destructive">{overdue.length}</div></div>
        <div className="stat-card"><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</div><div className="text-2xl font-bold font-headline text-success">{completed.length}</div></div>
        <div className="stat-card"><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Lists</div><div className="text-2xl font-bold font-headline">{taskLists.length}</div></div>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <div className="text-sm"><span className="font-semibold">{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</span> <span className="text-muted-foreground">need attention</span></div>
        </div>
      )}

      {/* Task Lists */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : taskLists.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ListTodo className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mb-3">No task lists yet</p>
          <Button size="sm" onClick={() => setShowCreateList(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Create First List</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {taskLists.map((list: any) => {
            const tasks = list.tasks || [];
            const completedCount = tasks.filter((t: any) => t.is_completed).length;
            return (
              <div key={list.id} className="bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold font-headline">{list.name}</h3>
                  <span className="text-xs text-muted-foreground">{completedCount}/{tasks.length}</span>
                </div>
                <div className="p-3 space-y-1">
                  {tasks.sort((a: any, b: any) => a.position - b.position).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30 group">
                      <Checkbox checked={task.is_completed} onCheckedChange={() => handleToggleTask(task.id, task.is_completed)} />
                      <span className={`flex-1 text-sm ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                      {task.due_date && !task.is_completed && new Date(task.due_date) < new Date() && (
                        <Badge className="stage-badge bg-destructive/15 text-destructive text-[10px]">Overdue</Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2 border-t border-border mt-2">
                    <Input
                      placeholder="Add a task..."
                      value={newTask[list.id] || ''}
                      onChange={e => setNewTask({ ...newTask, [list.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(list.id)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" className="h-8" onClick={() => handleAddTask(list.id)} disabled={!newTask[list.id]?.trim()}>Add</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
