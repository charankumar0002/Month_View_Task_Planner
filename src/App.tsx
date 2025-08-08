// src/App.tsx
import React, { useState } from "react";
import CalendarMonth from "./components/CalendarMonth";
import { CalenderTask } from "./types/calender";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks] = useState<CalenderTask[]>([
    {
      id: "1",
      title: "Project Kickoff",
      start: new Date(2025, 7, 10),
      end: new Date(2025, 7, 10),
      category: "work",
      color: "#e91e63",
    },
    {
      id: "2",
      title: "Doctor Appointment",
      start: new Date(2025, 7, 15),
      end: new Date(2025, 7, 15),
      category: "personal",
      color: "#4caf50",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          My Calendar
        </h1>
        <CalendarMonth 
          currentDate={currentDate} 
          onDateChange={setCurrentDate}
          tasks={tasks} 
        />
      </div>
    </div>
  );
};

export default App;
