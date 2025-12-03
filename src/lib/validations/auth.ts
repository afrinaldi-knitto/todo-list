import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string({ message: "Username tidak boleh kosong" })
    .min(1, "Username tidak boleh kosong")
    .min(3, "Username harus minimal 3 karakter")
    .max(100, "Username maksimal 100 karakter")
    .regex(/^[a-zA-Z0-9]+$/, "Username hanya boleh mengandung huruf dan angka"),
  password: z
    .string({ message: "Password tidak boleh kosong" })
    .min(6, "Password harus minimal 6 karakter")
    .max(255, "Password maksimal 255 karakter")
    .regex(/^\S+$/, "Password tidak boleh mengandung spasi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema validasi untuk login
 */
export const loginSchema = z.object({
  username: z.string({ message: "Username tidak boleh kosong" }),
  password: z.string({ message: "Password tidak boleh kosong" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
