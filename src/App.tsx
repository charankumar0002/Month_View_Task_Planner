// src/App.tsx
import React, { useState } from "react";
import CalendarMonth from "./components/CalendarMonth";
import { CalenderTask } from "./types/calender";

const App = () => {
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
    <div style={{ padding: "20px" }}>
      <h1>My Calendar</h1>
      <CalendarMonth currentDate={new Date(2025, 7, 1)} tasks={tasks} />
    </div>
  );
};

export default App;
