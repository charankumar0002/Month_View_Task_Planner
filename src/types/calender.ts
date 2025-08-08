export interface CalenderTask {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: "work" | "personal" | "reminder";
  color?: string;
}
