import { useState } from 'react';
import { DndContext, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { DayView } from './DayView';
import { JobCard } from './JobCard';

interface CalendarViewProps {
  jobs: any[];
  schedules: any[];
  members: any[];
  onJobDrop: (jobId: string, date: string, userId?: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function CalendarView({ jobs, schedules, members, onJobDrop }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeJob, setActiveJob] = useState<any>(null);

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(currentDate, 'MMMM yyyy');
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j: any) => j.id === event.active.id);
    setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const dropData = over.data.current as any;

    if (dropData?.date) {
      onJobDrop(jobId, dropData.date, dropData.userId);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Calendar controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{getDateLabel()}</h2>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Calendar view */}
        <div className="border rounded-lg p-4 bg-card">
          {viewMode === 'day' && (
            <DayView
              currentDate={currentDate}
              jobs={jobs}
              schedules={schedules}
              members={members}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              jobs={jobs}
              schedules={schedules}
              members={members}
              onDateClick={setCurrentDate}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              jobs={jobs}
              schedules={schedules}
              onDateClick={setCurrentDate}
            />
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeJob ? <JobCard job={activeJob} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
