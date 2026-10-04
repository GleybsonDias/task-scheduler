import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateUserProfile,
  updatePassword,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

// Rotas protegidas de utilizador
authRoutes.get("/me", authenticateToken, getProfile);
authRoutes.put("/profile", authenticateToken, updateUserProfile);
authRoutes.put("/change-password", authenticateToken, updatePassword);
