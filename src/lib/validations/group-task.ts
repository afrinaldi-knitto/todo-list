import { z } from "zod";

/**
 * Schema validasi untuk membuat group task
 */
export const createUpdateGroupTaskSchema = z.object({
  title: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  type: z.enum(["no_schedule", "schedule", "routine"], {
    message: "Type harus salah satu dari: no_schedule, schedule, atau routine",
  }),
  start_date: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(val)) return false;
        const date = new Date(val);
        return date instanceof Date && !isNaN(date.getTime());
      },
      {
        message: "Format start_date harus YYYY-MM-DD",
      }
    )
    .transform((val) => (val === "" ? null : val)),
  end_date: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(val)) return false;
        const date = new Date(val);
        return date instanceof Date && !isNaN(date.getTime());
      },
      {
        message: "Format end_date harus YYYY-MM-DD",
      }
    )
    .transform((val) => (val === "" ? null : val)),
});

export type CreateUpdateGroupTaskInput = z.infer<
  typeof createUpdateGroupTaskSchema
>;

/**
 * Schema validasi untuk update group task (partial update)
 * Semua field optional, hanya validasi key yang valid
 */
export const updateGroupTaskSchema = z
  .object({
    title: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val)),
    type: z
      .enum(["no_schedule", "schedule", "routine"], {
        message:
          "Type harus salah satu dari: no_schedule, schedule, atau routine",
      })
      .optional(),
    start_date: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (val === null || val === undefined || val === "") return true;
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(val)) return false;
          const date = new Date(val);
          return date instanceof Date && !isNaN(date.getTime());
        },
        {
          message: "Format start_date harus YYYY-MM-DD",
        }
      )
      .transform((val) => (val === "" ? null : val)),
    end_date: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (val === null || val === undefined || val === "") return true;
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(val)) return false;
          const date = new Date(val);
          return date instanceof Date && !isNaN(date.getTime());
        },
        {
          message: "Format end_date harus YYYY-MM-DD",
        }
      )
      .transform((val) => (val === "" ? null : val)),
  })
  .strict();

export type UpdateGroupTaskInput = z.infer<typeof updateGroupTaskSchema>;
