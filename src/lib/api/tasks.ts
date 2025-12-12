import { apiClient } from "./client";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTodoRequest,
  UpdateTodoRequest,
} from "@/types/api";

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>("/task");
  },

  async createTask(data: CreateTaskRequest): Promise<null> {
    return apiClient.post<null>("/task", data);
  },

  async updateTask(idTask: number, data: UpdateTaskRequest): Promise<null> {
    return apiClient.put<null>(`/task/${idTask}`, data);
  },

  async deleteTask(idTask: number): Promise<null> {
    return apiClient.delete<null>(`/task/${idTask}`);
  },

  async createTodo(idTask: number, data: CreateTodoRequest): Promise<null> {
    return apiClient.post<null>(`/task/${idTask}/todo`, data);
  },

  async updateTodo(
    idTask: number,
    idTodo: number,
    data: UpdateTodoRequest
  ): Promise<null> {
    return apiClient.put<null>(`/task/${idTask}/todo/${idTodo}`, data);
  },

  async deleteTodo(idTask: number, idTodo: number): Promise<null> {
    return apiClient.delete<null>(`/task/${idTask}/todo/${idTodo}`);
  },

  async markTodo(idTask: number, idTodo: number): Promise<null> {
    return apiClient.patch<null>(`/task/${idTask}/todo/${idTodo}/mark`);
  },

  async unmarkTodo(idTask: number, idTodo: number): Promise<null> {
    return apiClient.patch<null>(`/task/${idTask}/todo/${idTodo}/unmark`);
  },
};
