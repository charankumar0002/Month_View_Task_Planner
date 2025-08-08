// src/components/CalendarMonth.tsx
import React from "react";
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

interface CalendarMonthProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks?: CalenderTask[];
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  onDateChange,
  tasks = [],
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
            onClick={() => onDateChange(new Date())}
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
      <div className="grid grid-cols-7">
        {days.map((dayDate, i) => {
          const dayTasks = tasks.filter((t) => isSameDay(t.start, dayDate));
          const isCurrentMonth = isSameMonth(dayDate, monthStart);
          const isToday = isSameDay(dayDate, new Date());

          return (
            <div
              key={i}
              className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 ${
                isCurrentMonth ? "bg-white" : "bg-gray-50"
              } ${isToday ? "bg-blue-50" : ""}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? "text-gray-900" : "text-gray-400"
              } ${isToday ? "text-blue-600 font-bold" : ""}`}>
                {format(dayDate, "d")}
              </div>

              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: task.color || "#3b82f6" }}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonth;
