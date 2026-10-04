import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "O título da tarefa é obrigatório").trim(),
  description: z.string().optional(),
  dueDate: z
    .string()
    .datetime({ message: "Formato de data inválido (use ISO 8601)" })
    .optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  categoryId: z.string().uuid("ID de categoria inválido").optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "O título não pode ficar vazio").trim().optional(),
  description: z.string().optional(),
  dueDate: z
    .string()
    .datetime({ message: "Formato de data inválido (use ISO 8601)" })
    .nullable()
    .optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  categoryId: z.string().uuid("ID de categoria inválido").nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
