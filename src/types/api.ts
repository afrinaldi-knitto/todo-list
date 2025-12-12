export interface ApiResponse<T> {
  message: string;
  result: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id_user: number;
  name: string;
  username: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Todo {
  id_todo: number;
  title: string;
  is_done: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface Task {
  id_task: number;
  task_name: string;
  type: "routine" | "no_schedule" | "schedule";
  start_date: string | null;
  end_date: string | null;
  todos: Todo[];
}

export interface CreateTaskRequest {
  task_name: string | null;
  type: "routine" | "no_schedule" | "schedule";
  start_date: string | null;
  end_date: string | null;
}

export interface UpdateTaskRequest {
  task_name?: string | null;
  type?: "routine" | "no_schedule" | "schedule" | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface CreateTodoRequest {
  title: string;
  start_date: string | null;
  end_date: string | null;
}

export interface UpdateTodoRequest {
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}
