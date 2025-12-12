"use client";

import { useState } from "react";
import type { CreateTodoRequest, UpdateTodoRequest } from "@/types/api";

interface TodoFormProps {
  taskId: number;
  initialData?: {
    id_todo: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
  };
  onSubmit: (
    taskId: number,
    data: CreateTodoRequest | UpdateTodoRequest,
    todoId?: number
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TodoForm({
  taskId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [startDate, setStartDate] = useState(
    initialData?.start_date || ""
  );
  const [endDate, setEndDate] = useState(initialData?.end_date || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateTodoRequest | UpdateTodoRequest = {
      title: title.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
    };

    if (initialData) {
      await onSubmit(taskId, data, initialData.id_todo);
    } else {
      await onSubmit(taskId, data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <label
          htmlFor="todo-title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Judul Todo
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Masukkan judul todo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="todo-start-date"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tanggal Mulai
          </label>
          <input
            id="todo-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="todo-end-date"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tanggal Selesai
          </label>
          <input
            id="todo-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isLoading ? "Menyimpan..." : initialData ? "Update" : "Buat"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

