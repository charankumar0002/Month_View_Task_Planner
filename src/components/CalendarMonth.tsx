// src/components/CalendarMonth.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addYears,
  subMonths,
  subYears,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { CalenderTask } from "../types/calender";
import TaskModal from "./TaskModal";
import moment from "moment";

interface CalendarMonthProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks?: CalenderTask[];
  onTasksChange?: (tasks: CalenderTask[]) => void;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  onDateChange,
  tasks = [],
  onTasksChange,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Drag state
  const [dragState, setDragState] = useState<{
    mode: 'select' | 'resize';
    startDate: Date;
    currentDate: Date;
    taskId?: string;
    resizeEdge?: 'start' | 'end';
  } | null>(null);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    startDate?: Date;
    endDate?: Date;
    editingTask?: CalenderTask;
  }>({ isOpen: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const suppressNextClickRef = useRef(false);

  const xyToDate = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0) return null;
    
    const cellWidth = rect.width / 7;
    const cellHeight = rect.height / (days.length / 7);
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    const index = row * 7 + col;
    
    if (index < 0 || index >= days.length) return null;
    return days[index];
  };

  const categoryColors = {
    'To Do': '#dc2626',        // Red - urgent/pending
    'In Progress': '#ea580c',  // Orange - active work
    'Review': '#7c3aed',       // Purple - needs attention
    'Completed': '#059669',    // Green - success/done
    'work': '#e91e63',
    'personal': '#4caf50',
    'reminder': '#9c27b0'
  };

  const getTaskColor = (task: CalenderTask) => {
    return task.color || categoryColors[task.category as keyof typeof categoryColors] || '#3b82f6';
  };



  // Event handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const date = xyToDate(e.clientX, e.clientY);
    if (!date) return;

    const target = e.target as HTMLElement;
    const barEl = target.closest('[data-task-id]');

    if (barEl) {
      // Resize existing task
      const taskId = barEl.getAttribute('data-task-id');
      if (!taskId) return;
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const rect = barEl.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const edge = localX <= rect.width / 2 ? 'start' : 'end';

      setDragState({
        mode: 'resize',
        startDate: date,
        currentDate: date,
        taskId,
        resizeEdge: edge,
      });
      e.preventDefault();
    } else {
      // Create new task
      setDragState({
        mode: 'select',
        startDate: date,
        currentDate: date,
      });
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragState) return;
    const date = xyToDate(e.clientX, e.clientY);
    if (!date) return;

    setDragState(prev => prev ? { ...prev, currentDate: date } : prev);

    // Live update for resize
    if (dragState.mode === 'resize' && dragState.taskId && onTasksChange) {
      const updatedTasks = tasks.map(task => {
        if (task.id !== dragState.taskId) return task;
        
        let start = task.start;
        let end = task.end;
        
        if (dragState.resizeEdge === 'start') {
          start = date <= end ? date : end;
        } else {
          end = date >= start ? date : start;
        }
        
        return { ...task, start, end };
      });
      onTasksChange(updatedTasks);
    }
  };

  const onPointerUp = () => {
    if (!dragState) return;
    suppressNextClickRef.current = true;

    if (dragState.mode === 'select') {
      const startDate = dragState.startDate <= dragState.currentDate ? dragState.startDate : dragState.currentDate;
      const endDate = dragState.startDate <= dragState.currentDate ? dragState.currentDate : dragState.startDate;
      
      if (moment(startDate).isBefore(moment(), 'day')) {
        return; // Prevent creating tasks in past dates
      }
      
      setModalState({ isOpen: true, startDate, endDate });
    }

    setDragState(null);
  };

  const handleModalSubmit = (taskData: { title: string; category: string }) => {
    if (!onTasksChange) return;
    
    if (modalState.editingTask) {
      // Edit existing task
      onTasksChange(tasks.map(t => 
        t.id === modalState.editingTask!.id 
          ? { ...t, title: taskData.title, category: taskData.category as CalenderTask['category'] }
          : t
      ));
    } else {
      // Create new task
      if (!modalState.startDate || !modalState.endDate) return;
      const newTask: CalenderTask = {
        id: crypto.randomUUID(),
        title: taskData.title,
        category: taskData.category as CalenderTask['category'],
        start: modalState.startDate,
        end: modalState.endDate,
      };
      onTasksChange([...tasks, newTask]);
    }
  };

  const handleTaskDelete = () => {
    if (modalState.editingTask && onTasksChange) {
      onTasksChange(tasks.filter(t => t.id !== modalState.editingTask!.id));
      setModalState({ isOpen: false });
    }
  };

  const onClick = (e: React.MouseEvent) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    
    const date = xyToDate(e.clientX, e.clientY);
    if (!date) return;

    const target = e.target as HTMLElement;
    const barEl = target.closest('[data-task-id]');

    if (barEl) {
      // Edit existing task
      const taskId = barEl.getAttribute('data-task-id');
      if (!taskId) return;
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      setModalState({ isOpen: true, editingTask: task });
    } else {
      // Create single-day task
      if (moment(date).isBefore(moment(), 'day')) {
        return; // Prevent creating tasks in past dates
      }
      setModalState({ isOpen: true, startDate: date, endDate: date });
    }
  };

  useEffect(() => {
    const onUp = () => onPointerUp();
    const onMove = (e: PointerEvent) => onPointerMove(e);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
    };
  }, [dragState, tasks, onTasksChange]);

  // Selection overlay
  const selectionOverlay = useMemo(() => {
    if (!dragState || dragState.mode !== 'select') return null;
    
    const startDate = dragState.startDate <= dragState.currentDate ? dragState.startDate : dragState.currentDate;
    const endDate = dragState.startDate <= dragState.currentDate ? dragState.currentDate : dragState.startDate;
    
    const startIndex = days.findIndex(d => isSameDay(d, startDate));
    const endIndex = days.findIndex(d => isSameDay(d, endDate));
    
    if (startIndex === -1 || endIndex === -1) return null;
    
    const overlays = [];
    const cellWidth = 100 / 7;
    const cellHeight = 140;
    
    // Create segments for each row
    let currentIndex = startIndex;
    
    while (currentIndex <= endIndex) {
      const row = Math.floor(currentIndex / 7);
      const startCol = currentIndex % 7;
      let endCol = startCol;
      
      // Extend to end of row or end of selection
      while (endCol < 6 && currentIndex + (endCol - startCol) < endIndex) {
        endCol++;
      }
      
      const width = ((endCol - startCol + 1) * cellWidth);
      const left = startCol * cellWidth;
      const top = row * cellHeight;
      
      overlays.push(
        <div
          key={`overlay-${currentIndex}`}
          className="absolute bg-blue-200 bg-opacity-30 border-2 border-dashed border-blue-400 pointer-events-none"
          style={{
            left: `${left}%`,
            top: `${top}px`,
            width: `${width}%`,
            height: `${cellHeight}px`,
            zIndex: 5,
          }}
        />
      );
      
      currentIndex = row * 7 + 7; // Move to next row
    }
    
    return overlays;
  }, [dragState, days]);

  // Lane stacking to avoid overlap
  const rowLanes = useMemo(() => {
    const perRow: Record<number, Array<{taskId: string, colStart: number, colEnd: number}>> = {};
    for (const task of tasks) {
      const startIndex = days.findIndex(d => isSameDay(d, task.start));
      const endIndex = days.findIndex(d => isSameDay(d, task.end));
      if (startIndex === -1 || endIndex === -1) continue;
      
      let currentIndex = startIndex;
      while (currentIndex <= endIndex) {
        const row = Math.floor(currentIndex / 7);
        const startCol = currentIndex % 7;
        let endCol = startCol;
        while (endCol < 6 && currentIndex + (endCol - startCol) < endIndex) {
          endCol++;
        }
        
        perRow[row] = perRow[row] || [];
        perRow[row].push({ taskId: task.id, colStart: startCol, colEnd: endCol });
        currentIndex = row * 7 + 7;
      }
    }
    
    const laneByKey: Record<string, number> = {};
    Object.entries(perRow).forEach(([rowStr, segs]) => {
      const lanes: number[] = [];
      segs.sort((a, b) => a.colStart - b.colStart);
      for (const seg of segs) {
        let placed = false;
        for (let l = 0; l < lanes.length; l++) {
          if (seg.colStart > lanes[l]) {
            lanes[l] = seg.colEnd;
            laneByKey[`${seg.taskId}:${rowStr}`] = l;
            placed = true;
            break;
          }
        }
        if (!placed) {
          lanes.push(seg.colEnd);
          laneByKey[`${seg.taskId}:${rowStr}`] = lanes.length - 1;
        }
      }
    });
    return laneByKey;
  }, [tasks, days]);

  // Task bars with lane positioning
  const taskBars = useMemo(() => {
    const bars = [];
    const cellWidth = 100 / 7;
    const cellHeight = 140;
    const barHeight = 20;
    const barSpacing = 3;
    
    for (const task of tasks) {
      const startIndex = days.findIndex(d => isSameDay(d, task.start));
      const endIndex = days.findIndex(d => isSameDay(d, task.end));
      if (startIndex === -1 || endIndex === -1) continue;
      
      let currentIndex = startIndex;
      while (currentIndex <= endIndex) {
        const row = Math.floor(currentIndex / 7);
        const startCol = currentIndex % 7;
        let endCol = startCol;
        while (endCol < 6 && currentIndex + (endCol - startCol) < endIndex) {
          endCol++;
        }
        
        const lane = rowLanes[`${task.id}:${row}`] || 0;
        const width = ((endCol - startCol + 1) * cellWidth);
        const left = startCol * cellWidth;
        const top = row * cellHeight + 40 + lane * (barHeight + barSpacing);
        
        bars.push(
          <div
            key={`${task.id}-${row}`}
            data-task-id={task.id}
            className="absolute text-white text-xs px-2 py-1 rounded cursor-ew-resize hover:opacity-80 overflow-hidden whitespace-nowrap flex items-center justify-center text-center"
            style={{
              backgroundColor: getTaskColor(task),
              left: `${left}%`,
              top: `${top}px`,
              width: `${width}%`,
              height: `${barHeight}px`,
              zIndex: 10,
              lineHeight: `${barHeight}px`,
              transition: dragState?.mode === 'resize' && dragState?.taskId === task.id 
                ? 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: dragState?.mode === 'resize' && dragState?.taskId === task.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: dragState?.mode === 'resize' && dragState?.taskId === task.id 
                ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            title={task.title}
            onClick={(e) => {
              e.stopPropagation();
              setModalState({ isOpen: true, editingTask: task });
            }}
          >
            {task.title}
          </div>
        );
        
        currentIndex = row * 7 + 7;
      }
    }
    
    return bars;
  }, [tasks, days, rowLanes]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Navigation Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          {/* Year Navigation */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onDateChange(subYears(currentDate, 1))}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Previous Year"
            >
              ⟪
            </button>
            <button 
              onClick={() => onDateChange(addYears(currentDate, 1))}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Next Year"
            >
              ⟫
            </button>
          </div>

          {/* Month/Year Display */}
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>

          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onDateChange(subMonths(currentDate, 1))}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Previous Month"
            >
              ‹
            </button>
            <button 
              onClick={() => onDateChange(addMonths(currentDate, 1))}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Next Month"
            >
              ›
            </button>
          </div>
        </div>

        {/* Today Button */}
        <div className="flex justify-center mt-3">
          <button 
            onClick={() => onDateChange(moment().toDate())}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="p-3 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div 
        ref={containerRef}
        className="grid grid-cols-7 relative select-none"
        onPointerDown={onPointerDown}
        onClick={onClick}
        style={{ cursor: dragState?.mode === 'select' ? 'crosshair' : dragState?.mode === 'resize' ? 'ew-resize' : 'default' }}
      >
        {days.map((dayDate, i) => {
          const isCurrentMonth = isSameMonth(dayDate, monthStart);
          const isToday = isSameDay(dayDate, moment().toDate());

          return (
            <div
              key={i}
              className={`p-2 border-r border-b border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 ${
                isCurrentMonth ? "bg-white" : "bg-gray-50"
              }`}
              style={{ minHeight: '140px' }}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? "text-gray-900" : "text-gray-400"
              } ${isToday ? "text-white font-bold bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center " : ""}`}>
                {format(dayDate, "d")}
              </div>
            </div>
          );
        })}
        {selectionOverlay}
        {taskBars}
      </div>
      
      {/* Instructions */}
      <div className="p-4 bg-gray-50 text-sm text-gray-600">
        <p>Drag across days to create tasks • Click task left half to extend start • Click right half to extend end • Click task to edit/delete</p>
        <button 
          onClick={() => onTasksChange && onTasksChange([])} 
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      <TaskModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        onSubmit={handleModalSubmit}
        editingTask={modalState.editingTask}
        onDelete={handleTaskDelete}
      />
    </div>
  );
};

export default CalendarMonth;
