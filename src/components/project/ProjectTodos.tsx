import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckSquare, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
}

interface ProjectTodosProps {
  projectId: string;
  organizationId: string;
}

export function ProjectTodos({ projectId, organizationId }: ProjectTodosProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskLists = async () => {
    try {
      // Get task lists for this project
      const { data: lists, error: listsError } = await supabase
        .from('task_lists')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (listsError) throw listsError;

      // Get tasks for each list
      const listsWithTasks = await Promise.all((lists || []).map(async (list) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('task_list_id', list.id)
          .order('position', { ascending: true });

        return {
          ...list,
          tasks: tasks || []
        };
      }));

      setTaskLists(listsWithTasks);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskLists();
  }, [projectId, organizationId]);

  const createTaskList = async () => {
    if (!newListName.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('task_lists')
        .insert({
          name: newListName,
          organization_id: organizationId,
          project_id: projectId,
          created_by: user.id
        });

      if (error) throw error;

      toast({ title: 'To-do list created!' });
      setNewListName('');
      setNewListDialogOpen(false);
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const addTask = async (listId: string) => {
    const title = newTaskInputs[listId];
    if (!title?.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title,
          task_list_id: listId,
          created_by: user.id,
          position: 0
        });

      if (error) throw error;

      setNewTaskInputs({ ...newTaskInputs, [listId]: '' });
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: !task.is_completed,
          completed_at: !task.is_completed ? new Date().toISOString() : null,
          completed_by: !task.is_completed ? user?.id : null
        })
        .eq('id', task.id);

      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
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
          <h2 className="text-2xl font-headline font-bold">To-dos</h2>
          <p className="text-muted-foreground">Track tasks and assignments for this project</p>
        </div>
        <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 gap-2">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a To-do List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTaskList()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewListDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90"
                  onClick={createTaskList}
                  disabled={submitting || !newListName.trim()}
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create List
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Lists */}
      {taskLists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No to-do lists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a list to start tracking tasks
            </p>
            <Button onClick={() => setNewListDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Create First List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {taskLists.map((list) => {
            const completedCount = list.tasks.filter(t => t.is_completed).length;
            const totalCount = list.tasks.length;

            return (
              <Card key={list.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    {totalCount > 0 && (
                      <Badge variant="secondary">
                        {completedCount}/{totalCount} done
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Tasks */}
                  {list.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.is_completed ? 'bg-muted/50 opacity-60' : 'bg-card'
                      }`}
                    >
                      <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={() => toggleTask(task)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={task.is_completed ? 'line-through' : ''}>
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Task Input */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add a to-do..."
                      value={newTaskInputs[list.id] || ''}
                      onChange={(e) => setNewTaskInputs({ ...newTaskInputs, [list.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(list.id)}
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={() => addTask(list.id)}
                      disabled={!newTaskInputs[list.id]?.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
