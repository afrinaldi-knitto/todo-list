"use client";

import { useState } from "react";
import type { CreateTaskRequest, UpdateTaskRequest } from "@/types/api";

interface TaskFormProps {
  initialData?: {
    id_task: number;
    task_name: string;
    type: "routine" | "no_schedule" | "schedule";
    start_date: string | null;
    end_date: string | null;
  };
  onSubmit: (
    data: CreateTaskRequest | UpdateTaskRequest,
    taskId?: number
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [taskName, setTaskName] = useState(initialData?.task_name || "");
  const [type, setType] = useState<"routine" | "no_schedule" | "schedule">(
    initialData?.type || "no_schedule"
  );
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "schedule" && (!startDate || !endDate)) {
      alert(
        "Untuk type schedule, tanggal mulai dan tanggal selesai wajib diisi"
      );
      return;
    }

    const data: CreateTaskRequest | UpdateTaskRequest = {
      task_name: taskName.trim() || null,
      type,
      start_date:
        type === "routine" || type === "schedule" ? startDate || null : null,
      end_date:
        type === "routine" || type === "schedule" ? endDate || null : null,
    };

    if (initialData) {
      await onSubmit(data, initialData.id_task);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <label
          htmlFor="task-name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nama Task
        </label>
        <input
          id="task-name"
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Masukkan nama task (opsional)"
        />
      </div>

      <div>
        <label
          htmlFor="task-type"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Tipe Task
        </label>
        <select
          id="task-type"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "routine" | "no_schedule" | "schedule")
          }
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="no_schedule">No Schedule</option>
          <option value="routine">Routine</option>
          <option value="schedule">Schedule</option>
        </select>
      </div>

      {(type === "routine" || type === "schedule") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-start-date"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Tanggal Mulai{" "}
              {type === "schedule" && <span className="text-red-500">*</span>}
            </label>
            <input
              id="task-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required={type === "schedule"}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="task-end-date"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Tanggal Selesai{" "}
              {type === "schedule" && <span className="text-red-500">*</span>}
            </label>
            <input
              id="task-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={type === "schedule"}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isLoading ? "Menyimpan..." : initialData ? "Update" : "Buat Task"}
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
