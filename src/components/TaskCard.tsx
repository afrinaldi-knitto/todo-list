"use client";

import { useState } from "react";
import type { Task, Todo } from "@/types/api";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import ConfirmModal from "./ConfirmModal";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => Promise<void>;
  onTodoCreate: (
    taskId: number,
    data: { title: string; start_date: string | null; end_date: string | null }
  ) => Promise<void>;
  onTodoEdit: (
    taskId: number,
    todo: Todo,
    data: {
      title: string | null;
      start_date: string | null;
      end_date: string | null;
    }
  ) => Promise<void>;
  onTodoDelete: (taskId: number, todoId: number) => Promise<void>;
  onTodoMark: (taskId: number, todoId: number) => Promise<void>;
  onTodoUnmark: (taskId: number, todoId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onTodoCreate,
  onTodoEdit,
  onTodoDelete,
  onTodoMark,
  onTodoUnmark,
  isLoading = false,
}: TaskCardProps) {
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id_task);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTodoEdit = (taskId: number, todo: Todo) => {
    if (showTodoForm && !editingTodo) {
      setShowTodoForm(false);
    }
    setEditingTodo(todo);
  };

  const handleTodoSubmit = async (
    taskId: number,
    data: {
      title: string | null;
      start_date: string | null;
      end_date: string | null;
    },
    todoId?: number
  ) => {
    if (todoId && editingTodo) {
      await onTodoEdit(taskId, editingTodo, data);
      setEditingTodo(null);
    } else {
      await onTodoCreate(taskId, {
        title: data.title || "",
        start_date: data.start_date,
        end_date: data.end_date,
      });
      setShowTodoForm(false);
    }
  };

  const handleAddTodoClick = () => {
    if (editingTodo) {
      setEditingTodo(null);
    }
    setShowTodoForm(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {task.task_name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.type === "routine"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : task.type === "schedule"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {task.type === "routine"
                  ? "Routine"
                  : task.type === "schedule"
                  ? "Schedule"
                  : "No Schedule"}
              </span>
              {task.start_date && task.end_date && (
                <span>
                  {formatDate(task.start_date)} - {formatDate(task.end_date)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              disabled={isLoading}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
              title="Edit Task"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting || isLoading}
              className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              title="Hapus Task"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {task.todos.length > 0 && (
          <div className="mb-4 space-y-2">
            {task.todos.map((todo) => (
              <TodoItem
                key={todo.id_todo}
                taskId={task.id_task}
                todo={todo}
                onEdit={handleTodoEdit}
                onDelete={onTodoDelete}
                onMark={onTodoMark}
                onUnmark={onTodoUnmark}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}

        {showTodoForm || editingTodo ? (
          <div className="mb-4">
            <TodoForm
              taskId={task.id_task}
              initialData={editingTodo || undefined}
              onSubmit={handleTodoSubmit}
              onCancel={() => {
                setShowTodoForm(false);
                setEditingTodo(null);
              }}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <button
            onClick={handleAddTodoClick}
            disabled={isLoading}
            className="w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            + Tambah Todo
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Task"
        message="Apakah Anda yakin ingin menghapus task ini? Semua todo di dalam task ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
