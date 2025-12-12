"use client";

import { useState } from "react";
import type { Todo } from "@/types/api";
import ConfirmModal from "./ConfirmModal";

interface TodoItemProps {
  taskId: number;
  todo: Todo;
  onEdit: (taskId: number, todo: Todo) => void;
  onDelete: (taskId: number, todoId: number) => Promise<void>;
  onMark: (taskId: number, todoId: number) => Promise<void>;
  onUnmark: (taskId: number, todoId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function TodoItem({
  taskId,
  todo,
  onEdit,
  onDelete,
  onMark,
  onUnmark,
  isLoading = false,
}: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (todo.is_done) {
        await onUnmark(taskId, todo.id_todo);
      } else {
        await onMark(taskId, todo.id_todo);
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(taskId, todo.id_todo);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
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
    <div
      className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        todo.is_done
          ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
          : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={isToggling || isLoading}
        className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 transition-colors ${
          todo.is_done
            ? "border-green-500 bg-green-500"
            : "border-zinc-300 dark:border-zinc-600"
        } ${isToggling || isLoading ? "opacity-50" : "cursor-pointer"}`}
      >
        {todo.is_done && (
          <svg
            className="h-full w-full text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <h4
          className={`text-sm font-medium ${
            todo.is_done
              ? "text-zinc-500 line-through dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {todo.title}
        </h4>
        {(todo.start_date || todo.end_date) && (
          <div className="mt-1 flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {todo.start_date && (
              <span>Mulai: {formatDate(todo.start_date)}</span>
            )}
            {todo.end_date && (
              <span>Selesai: {formatDate(todo.end_date)}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(taskId, todo)}
          disabled={isLoading}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          title="Edit"
        >
          <svg
            className="h-4 w-4"
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
          className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          title="Hapus"
        >
          <svg
            className="h-4 w-4"
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Todo"
        message="Apakah Anda yakin ingin menghapus todo ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}

