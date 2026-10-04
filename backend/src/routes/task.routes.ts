import { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  remove,
} from "../controllers/task.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const taskRoutes = Router();

// Todas as rotas de tarefas exigem token JWT válido
taskRoutes.use(authenticateToken);

taskRoutes.post("/", create);
taskRoutes.get("/", list);
taskRoutes.get("/:id", getById);
taskRoutes.put("/:id", update);
taskRoutes.delete("/:id", remove);
