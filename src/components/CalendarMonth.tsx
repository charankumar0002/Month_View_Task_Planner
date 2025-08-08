// src/components/CalendarMonth.tsx
import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { CalenderTask } from "../types/calender";

interface CalendarMonthProps {
  currentDate: Date;
  tasks?: CalenderTask[];
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
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
    <div>
      {/* Weekday Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          fontWeight: "bold",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} style={{ padding: "8px", textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((dayDate, i) => {
          const dayTasks = tasks.filter((t) => isSameDay(t.start, dayDate));

          return (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                minHeight: "80px",
                backgroundColor: isSameMonth(dayDate, monthStart)
                  ? "#fff"
                  : "#f8f8f8",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                {format(dayDate, "d")}
              </div>

              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: task.color || "#1976d2",
                    color: "#fff",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    marginTop: "2px",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {task.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonth;
