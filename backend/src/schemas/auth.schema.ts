import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "A palavra-passe deve ter no mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Endereço de email inválido").toLowerCase().trim(),
  password: z.string().min(1, "A palavra-passe é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
