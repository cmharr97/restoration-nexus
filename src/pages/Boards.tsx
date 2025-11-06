import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Boards() {
  return (
    <ProtectedRoute requireOrganization>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 mt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <BoardsContent />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function BoardsContent() {
  const { organization } = useOrganization();
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [activeCard, setActiveCard] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (organization) {
      fetchBoards();
    }
  }, [organization]);

  useEffect(() => {
    if (selectedBoard) {
      fetchBoardData();
    }
  }, [selectedBoard]);

  const fetchBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);
      
      if (data && data.length > 0 && !selectedBoard) {
        setSelectedBoard(data[0]);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardData = async () => {
    try {
      const { data: columnsData, error: colError } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', selectedBoard.id)
        .order('position', { ascending: true });

      if (colError) throw colError;
      setColumns(columnsData || []);

      const { data: cardsData, error: cardsError } = await supabase
        .from('kanban_cards')
        .select(`
          *,
          assigned_user:assigned_to(id, full_name, email)
        `)
        .in('column_id', (columnsData || []).map(c => c.id))
        .order('position', { ascending: true });

      if (cardsError) throw cardsError;
      setCards(cardsData || []);
    } catch (error) {
      console.error('Error fetching board data:', error);
      toast.error('Failed to load board data');
    }
  };

  const handleCreateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const { data: board, error: boardError } = await supabase
        .from('kanban_boards')
        .insert({
          name,
          description,
          organization_id: organization!.id,
          created_by: (await supabase.auth.getUser()).data.user!.id,
        })
        .select()
        .single();

      if (boardError) throw boardError;

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', color: '#6b7280', position: 0 },
        { name: 'In Progress', color: '#3b82f6', position: 1 },
        { name: 'Review', color: '#f59e0b', position: 2 },
        { name: 'Done', color: '#10b981', position: 3 },
      ];

      const { error: colError } = await supabase
        .from('kanban_columns')
        .insert(
          defaultColumns.map(col => ({
            ...col,
            board_id: board.id,
          }))
        );

      if (colError) throw colError;

      toast.success('Board created successfully');
      setCreateBoardOpen(false);
      fetchBoards();
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    }
  };

  const handleCreateCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    try {
      const columnCards = cards.filter(c => c.column_id === selectedColumn);
      const position = columnCards.length;

      const { error } = await supabase
        .from('kanban_cards')
        .insert({
          title,
          description,
          priority,
          column_id: selectedColumn,
          position,
          created_by: (await supabase.auth.getUser()).data.user!.id,
        });

      if (error) throw error;

      toast.success('Card created successfully');
      setCreateCardOpen(false);
      fetchBoardData();
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === event.active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (!activeCard || !overColumn) return;

    if (activeCard.column_id === overColumn.id) return;

    try {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ column_id: overColumn.id })
        .eq('id', activeCard.id);

      if (error) throw error;

      toast.success('Card moved successfully');
      fetchBoardData();
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move card');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-info/10 text-info border-info/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading boards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Project Boards</h1>
          <p className="text-muted-foreground mt-1">
            Visual workflow management for your projects
          </p>
        </div>
        <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>
                Create a new board to organize your work visually
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <Label htmlFor="name">Board Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Project Pipeline"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What's this board for?"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Board</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Board Selector */}
      {boards.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {boards.map((board) => (
            <Button
              key={board.id}
              variant={selectedBoard?.id === board.id ? 'default' : 'outline'}
              onClick={() => setSelectedBoard(board)}
              className="whitespace-nowrap"
            >
              {board.name}
            </Button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {boards.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No boards yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first board to start organizing work visually
                </p>
              </div>
              <Button onClick={() => setCreateBoardOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {selectedBoard && columns.length > 0 && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
              const columnCards = cards.filter(c => c.column_id === column.id);
              
              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-80"
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          {column.name}
                          <Badge variant="secondary" className="ml-auto">
                            {columnCards.length}
                          </Badge>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedColumn(column.id);
                            setCreateCardOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 min-h-[200px]">
                      <SortableContext
                        items={columnCards.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {columnCards.map((card) => (
                          <KanbanCard key={card.id} card={card} getPriorityColor={getPriorityColor} />
                        ))}
                      </SortableContext>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="bg-card p-3 rounded-lg border shadow-lg opacity-90">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm">{activeCard.title}</h4>
                  <Badge className={getPriorityColor(activeCard.priority)} variant="outline">
                    {activeCard.priority}
                  </Badge>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Card Dialog */}
      <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>
              Create a new task or item for this column
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                name="title"
                placeholder="Card title"
                required
              />
            </div>
            <div>
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                name="description"
                placeholder="Add details..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="card-priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Add Card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanCard({ card, getPriorityColor }: { card: any; getPriorityColor: (priority: string) => string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card p-3 rounded-lg border hover:border-accent transition-colors cursor-move"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm flex-1">{card.title}</h4>
        <Badge className={getPriorityColor(card.priority)} variant="outline">
          {card.priority}
        </Badge>
      </div>
      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {card.description}
        </p>
      )}
      {card.assigned_user && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
            {card.assigned_user.full_name?.[0] || card.assigned_user.email?.[0]}
          </div>
          <span className="text-xs text-muted-foreground">
            {card.assigned_user.full_name || card.assigned_user.email}
          </span>
        </div>
      )}
    </div>
  );
}