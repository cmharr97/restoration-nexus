import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare, Plus, Trash2, Loader2, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  return (
    <ProtectedRoute requireOrganization>
      <TasksContent />
    </ProtectedRoute>
  );
}

function TasksContent() {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);
  const [listName, setListName] = useState('');
  const [newTask, setNewTask] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTaskLists();
  }, [organization]);

  const fetchTaskLists = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('task_lists' as any)
        .select(`
          *,
          tasks:tasks (
            *,
            assigned:assigned_to (
              full_name,
              email
            )
          )
        `)
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
        .insert({
          organization_id: organization.id,
          name: listName.trim(),
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'List Created',
        description: 'New task list has been created',
      });

      setListName('');
      setShowCreateList(false);
      fetchTaskLists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async (taskListId: string) => {
    if (!user || !newTask[taskListId]?.trim()) return;

    try {
      const taskList = taskLists.find((l: any) => l.id === taskListId);
      const maxPosition = Math.max(...(taskList?.tasks?.map((t: any) => t.position) || [0]), 0);

      const { error } = await supabase
        .from('tasks' as any)
        .insert({
          task_list_id: taskListId,
          title: newTask[taskListId].trim(),
          position: maxPosition + 1,
          created_by: user.id,
        });

      if (error) throw error;

      setNewTask({ ...newTask, [taskListId]: '' });
      fetchTaskLists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks' as any)
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null,
          completed_by: !isCompleted ? user?.id : null,
        })
        .eq('id', taskId);

      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks' as any)
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTaskLists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 mt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2">Tasks & To-dos</h1>
              <p className="text-muted-foreground text-lg">
                Track work and keep everyone accountable
              </p>
            </div>
            
            <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task List</DialogTitle>
                  <DialogDescription>
                    Create a new list to organize your tasks
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listName">List Name *</Label>
                    <Input
                      id="listName"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="e.g., This Week's Tasks"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateList} disabled={!listName.trim()}>
                      Create List
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateList(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : taskLists.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mb-4">No task lists yet</p>
                <Button onClick={() => setShowCreateList(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taskLists.map((list: any) => {
                const completedCount = list.tasks?.filter((t: any) => t.is_completed).length || 0;
                const totalCount = list.tasks?.length || 0;

                return (
                  <Card key={list.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{list.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {completedCount} / {totalCount}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Task List */}
                      <div className="space-y-2">
                        {list.tasks
                          ?.sort((a: any, b: any) => a.position - b.position)
                          .map((task: any) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/5"
                            >
                              <Checkbox
                                checked={task.is_completed}
                                onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                              />
                              <span className={`flex-1 text-sm ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>

                      {/* Add New Task */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Input
                          placeholder="Add a task..."
                          value={newTask[list.id] || ''}
                          onChange={(e) => setNewTask({ ...newTask, [list.id]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTask(list.id)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(list.id)}
                          disabled={!newTask[list.id]?.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
