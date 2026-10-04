import { Request, Response } from "express";
import { ZodError } from "zod";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema.js";
import * as taskService from "../services/task.service.js";

export async function create(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const validatedData = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(userId, validatedData);
    return res.status(201).json(task);
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

export async function list(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const tasks = await taskService.listTasks(userId);
    return res.status(200).json(tasks);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.getTaskById(userId, id);
    return res.status(200).json(task);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validatedData = updateTaskSchema.parse(req.body);
    const updated = await taskService.updateTask(userId, id, validatedData);
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

export async function remove(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await taskService.deleteTask(userId, id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}
