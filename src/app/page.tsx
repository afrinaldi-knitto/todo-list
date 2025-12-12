"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { tasksApi } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/client";
import { socketService, type TodoChangeEvent } from "@/lib/socket";
import type {
  Task,
  Todo,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types/api";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    isAuthenticated,
    isLoading: authLoading,
    logout,
    user,
    token,
  } = useAuth();
  const router = useRouter();
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (socketInitialized.current) {
        socketService.disconnect();
        socketInitialized.current = false;
      }

      const socket = socketService.connect(token);
      socketInitialized.current = true;

      const handleSocketChange = (data: TodoChangeEvent) => {
        handleTodoChange(data);
      };

      socket.on("todo:change", handleSocketChange);

      return () => {
        socket.off("todo:change", handleSocketChange);
        socketService.disconnect();
        socketInitialized.current = false;
      };
    } else {
      if (socketInitialized.current) {
        socketService.disconnect();
        socketInitialized.current = false;
      }
    }
  }, [isAuthenticated, token]);

  const handleTodoChange = (data: TodoChangeEvent) => {
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex(
        (task) => task.id_task === data.id_task
      );

      if (taskIndex === -1) return prevTasks;

      const updatedTasks = [...prevTasks];
      const task = { ...updatedTasks[taskIndex] };
      const todo: Todo = {
        id_todo: data.todo.id_todo,
        title: data.todo.title,
        is_done: data.todo.is_done === 1,
        start_date: data.todo.start_date,
        end_date: data.todo.end_date,
      };

      if (data.action === "created") {
        task.todos = [...task.todos, todo];
      } else if (data.action === "updated") {
        const todoIndex = task.todos.findIndex(
          (t) => t.id_todo === data.todo.id_todo
        );
        if (todoIndex !== -1) {
          task.todos[todoIndex] = todo;
        }
      } else if (data.action === "deleted") {
        task.todos = task.todos.filter((t) => t.id_todo !== data.todo.id_todo);
      }

      updatedTasks[taskIndex] = task;
      return updatedTasks;
    });
  };

  const handleApiError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        logout();
        router.push("/login");
        return true;
      } else {
        setError(err.message);
      }
    } else {
      setError("Terjadi kesalahan");
    }
    return false;
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    if (showTaskForm && !editingTask) {
      setShowTaskForm(false);
    }
    setEditingTask(task);
  };

  const handleCreateTask = async (data: CreateTaskRequest) => {
    try {
      await tasksApi.createTask(data);
      setShowTaskForm(false);
      setSuccessMessage("Task berhasil dibuat");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTasks();
    } catch (err) {
      if (!handleApiError(err)) {
        throw err;
      }
    }
  };

  const handleUpdateTask = async (data: UpdateTaskRequest, taskId: number) => {
    try {
      await tasksApi.updateTask(taskId, data);
      setEditingTask(null);
      setSuccessMessage("Task berhasil diupdate");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTasks();
    } catch (err) {
      if (!handleApiError(err)) {
        throw err;
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksApi.deleteTask(taskId);
      setSuccessMessage("Task berhasil dihapus");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchTasks();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleTodoCreate = async (
    taskId: number,
    data: { title: string; start_date: string | null; end_date: string | null }
  ) => {
    try {
      await tasksApi.createTodo(taskId, data);
      setSuccessMessage("Todo berhasil dibuat");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (!handleApiError(err)) {
        throw err;
      }
    }
  };

  const handleTodoEdit = async (
    taskId: number,
    todo: Todo,
    data: {
      title: string | null;
      start_date: string | null;
      end_date: string | null;
    }
  ) => {
    try {
      await tasksApi.updateTodo(taskId, todo.id_todo, data);
      setSuccessMessage("Todo berhasil diupdate");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (!handleApiError(err)) {
        throw err;
      }
    }
  };

  const handleTodoDelete = async (taskId: number, todoId: number) => {
    try {
      await tasksApi.deleteTodo(taskId, todoId);
      setSuccessMessage("Todo berhasil dihapus");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleTodoMark = async (taskId: number, todoId: number) => {
    try {
      await tasksApi.markTodo(taskId, todoId);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleTodoUnmark = async (taskId: number, todoId: number) => {
    try {
      await tasksApi.unmarkTodo(taskId, todoId);
    } catch (err) {
      handleApiError(err);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Todo List
            </h1>
            {user && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Selamat datang, {user.name}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>

        {/* Messages */}
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* Task Form - Hanya tampil salah satu (tambah atau edit) */}
        {showTaskForm && !editingTask && (
          <div className="mb-6">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {editingTask && !showTaskForm && (
          <div className="mb-6">
            <TaskForm
              initialData={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tasks List */}
        {isLoading && tasks.length === 0 ? (
          <LoadingSpinner />
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              Belum ada task. Buat task pertama Anda!
            </p>
            {!showTaskForm && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="mt-4 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Buat Task Baru
              </button>
            )}
          </div>
        ) : (
          <>
            {!showTaskForm && !editingTask && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (editingTask) {
                      setEditingTask(null);
                    }
                    setShowTaskForm(true);
                  }}
                  className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  + Buat Task Baru
                </button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id_task}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onTodoCreate={handleTodoCreate}
                  onTodoEdit={handleTodoEdit}
                  onTodoDelete={handleTodoDelete}
                  onTodoMark={handleTodoMark}
                  onTodoUnmark={handleTodoUnmark}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
