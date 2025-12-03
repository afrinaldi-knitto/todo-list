import { Task } from "./task";

export type GroupTaskType = "no_schedule" | "schedule" | "routine";

export interface GroupTask {
  id: string;
  title?: string;
  type?: GroupTaskType;
  start_date?: string;
  end_date?: string;
}

export interface GroupTaskResponse {
  id: string;
  title?: string;
  type?: GroupTaskType;
  startDate?: string;
  endDate?: string;
  tasks: Task[];
}
