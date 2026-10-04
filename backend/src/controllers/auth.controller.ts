import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    return res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação nos dados enviados",
        issues: error.issues,
      });
    }
    return res.status(400).json({ message: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação nos dados enviados",
        issues: error.issues,
      });
    }
    return res.status(401).json({ message: error.message });
  }
}

export async function getProfile(req: Request, res: Response) {
  return res.status(200).json({
    message: "Perfil autenticado com sucesso",
    user: req.user,
  });
}

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await authService.updateProfile(userId, validatedData);
    return res.status(200).json(updated);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação nos dados enviados",
        issues: error.issues,
      });
    }
    return res.status(400).json({ message: error.message });
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const validatedData = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, validatedData);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação nos dados enviados",
        issues: error.issues,
      });
    }
    return res.status(400).json({ message: error.message });
  }
}
