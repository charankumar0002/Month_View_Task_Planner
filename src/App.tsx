// src/App.tsx
import { useState, useMemo, useEffect } from "react";
import CalendarMonth from "./components/CalendarMonth";
import FilterPanel from "./components/FilterPanel";
import { CalenderTask } from "./types/calender";
import { addWeeks, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import moment from "moment";

const App = () => {
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [tasks, setTasks] = useState<CalenderTask[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('calendar-tasks');
    if (saved) {
      const parsed = JSON.parse(saved).map((task: any) => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end),
      }));
      setTasks(parsed);
    } else {
      // Default tasks if none saved
      setTasks([
        {
          id: "1",
          title: "Project Kickoff",
          start: moment().add(5, 'days').toDate(),
          end: moment().add(5, 'days').toDate(),
          category: "To Do",
        },
        {
          id: "2",
          title: "Doctor Appointment",
          start: moment().add(10, 'days').toDate(),
          end: moment().add(10, 'days').toDate(),
          category: "In Progress",
        },
      ]);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('calendar-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState('');

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilters.length > 0) {
      filtered = filtered.filter(task => 
        categoryFilters.includes(task.category)
      );
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      const weeks = parseInt(timeFilter.replace('weeks', '').replace('week', ''));
      const endDate = addWeeks(now, weeks);
      
      filtered = filtered.filter(task => 
        isWithinInterval(task.start, { start: startOfDay(now), end: endOfDay(endDate) }) ||
        isWithinInterval(task.end, { start: startOfDay(now), end: endOfDay(endDate) })
      );
    }

    return filtered;
  }, [tasks, searchTerm, categoryFilters, timeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Task Planner
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilters={categoryFilters}
              onCategoryChange={setCategoryFilters}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </div>
          <div className="lg:col-span-3">
            <CalendarMonth 
              currentDate={currentDate} 
              onDateChange={setCurrentDate}
              tasks={filteredTasks}
              onTasksChange={setTasks}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
